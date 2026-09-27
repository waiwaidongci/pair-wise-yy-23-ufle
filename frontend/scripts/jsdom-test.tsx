/**
 * jsdom 端到端冒烟测试：完整挂载 React App + fake-indexeddb，
 * 覆盖路由切换、筛选、开练提交即时反馈、刷新恢复、错题本与进度页渲染。
 * 运行：node scripts/jsdom-test.mjs（由 esbuild 打包）
 */
import { JSDOM } from "jsdom";
import "fake-indexeddb/auto";

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: "http://localhost/#/learn",
  pretendToBeVisual: true
});

const g = globalThis as Record<string, unknown>;
g.window = dom.window;
g.document = dom.window.document;
g.navigator = dom.window.navigator;
g.HTMLElement = dom.window.HTMLElement;
g.Element = dom.window.Element;
g.Node = dom.window.Node;
g.Event = dom.window.Event;
g.MouseEvent = dom.window.MouseEvent;
g.getComputedStyle = dom.window.getComputedStyle;
g.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 0) as unknown as number;
g.cancelAnimationFrame = (id: number) => clearTimeout(id);
g.matchMedia = undefined;
// MUI 需要 matchMedia
dom.window.matchMedia = dom.window.matchMedia || ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => undefined,
  removeListener: () => undefined,
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
  dispatchEvent: () => false
}));
g.matchMedia = dom.window.matchMedia;

const { createRoot } = await import("react-dom/client");
const React = (await import("react")).default;
const { default: App } = await import("../src/App");

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const click = (el: Element) => {
  const evt = new dom.window.MouseEvent("click", { bubbles: true, cancelable: true });
  el.dispatchEvent(evt);
};

let passed = 0;
const assert = (cond: boolean, msg: string) => {
  if (!cond) {
    console.error("✗", msg);
    process.exitCode = 1;
  } else {
    passed += 1;
    console.log("✓", msg);
  }
};

async function flush(ms = 30) {
  await sleep(ms);
}

async function main() {
  const root = createRoot(document.getElementById("root")!);
  root.render(React.createElement(App));
  await flush(150);

  // 学习卡片页
  assert(document.body.textContent!.includes("认识盲文六点字符"), "学习卡片页标题渲染");
  assert(document.querySelectorAll(".symbol-card").length === 47, "渲染 47 张字符卡片");

  // 数字筛选
  const chips = [...document.querySelectorAll(".filters-panel button")];
  click(chips.find((b) => b.textContent!.trim() === "数字")!);
  await flush(50);
  assert(document.querySelectorAll(".symbol-card").length === 10, "数字筛选 -> 10 张卡片");
  click(chips.find((b) => b.textContent!.trim().startsWith("全部"))!);
  await flush(50);

  // 切到练习页
  click([...document.querySelectorAll("nav button")].find((b) => b.textContent!.includes("练习模式"))!);
  await flush(80);
  assert(document.body.textContent!.includes("从课程开始一轮练习"), "练习选择页渲染");
  assert(document.querySelectorAll(".lesson-item").length === 6, "列出 6 门课程");

  // 选课程 2 + 混合模式，开始
  click([...document.querySelectorAll(".lesson-item")].find((b) => b.textContent!.includes("k-t"))!);
  await flush(20);
  click([...document.querySelectorAll(".mode-item")].find((b) => b.textContent!.includes("混合模式"))!);
  await flush(20);
  click([...document.querySelectorAll("button.primary-btn")].find((b) => b.textContent!.includes("开始练习"))!);
  await flush(120);

  assert(document.querySelector(".practice-panel") !== null, "进入练习面板");
  const choices = document.querySelectorAll(".choice-option");
  assert(choices.length === 4, `每题 4 个选项（实际 ${choices.length}）`);

  // 点第 2 个选项提交：立刻出现反馈
  click(choices[1]);
  await flush(150);
  const feedback = document.querySelector(".feedback-stage");
  assert(feedback !== null, "提交后立刻显示结果区");
  const badgeText = feedback!.querySelector(".badge")!.textContent!;
  assert(/回答正确|回答错误/.test(badgeText), `结果徽章：${badgeText}`);
  assert(/正确答案/.test(feedback!.textContent!), "反馈含正确答案");

  // 下一题
  const nextBtn = [...feedback!.querySelectorAll("button")].find((b) => b.textContent!.includes("题"))!;
  click(nextBtn);
  await flush(80);
  assert(document.querySelectorAll(".choice-option").length === 4, "进入下一题");

  // 模拟关闭页面再打开：重新挂载 App（IndexedDB 由 fake-indexeddb 持久保留）
  root.unmount();
  await flush(30);
  const root2 = createRoot(document.getElementById("root")!);
  root2.render(React.createElement(App));
  await flush(200);
  // 默认 hash 仍是 /practice（jsdom url 保留），应恢复草稿
  const panel = document.querySelector(".practice-panel");
  assert(panel !== null, "重新打开后自动恢复进行中的练习");
  assert(panel!.textContent!.includes("k-t"), "恢复的仍是课程 2（原练习顺序保留）");

  // 错题本页
  click([...document.querySelectorAll("nav button")].find((b) => b.textContent!.includes("错题本"))!);
  await flush(150);
  assert(document.body.textContent!.includes("错题本"), "错题本页渲染");
  assert(/连续答对 \d\/3/.test(document.body.textContent!), "显示连续答对 x/3 计数");

  // 进度页
  click([...document.querySelectorAll("nav button")].find((b) => b.textContent!.includes("学习进度"))!);
  await flush(150);
  assert(document.body.textContent!.includes("按课程的学习进度"), "进度页按课程区块渲染");
  assert(document.querySelectorAll(".lesson-progress-row").length === 6, "6 门课程的进度行");
  assert(document.querySelectorAll(".chart-panel").length === 3, "3 个图表面板");
  assert(/正确率/.test(document.body.textContent!), "展示正确率");

  root2.unmount();
  console.log(`\n${passed} 项 jsdom 断言通过`);
  if (process.exitCode) process.exit(process.exitCode);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
