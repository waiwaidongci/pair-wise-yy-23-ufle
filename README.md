# 盲文点字学习训练器（braille-trainer）

纯前端盲文点字学习与练习工具：从课程选择点字字符开始一轮练习，提交答案后**立刻显示对错**；练习会话与每道答题记录保存在浏览器 IndexedDB，答错字符直接进错题本，同一字符连续答对 3 次才移出，中途再错立即从零计数；学习进度按课程统计完成次数、正确率与最近趋势。

## 快速启动（推荐 Docker Compose）

```bash
cp .env.example .env && docker compose up -d
```

启动后访问：<http://localhost:20111>

停止与清理：

```bash
docker compose down          # 停止
docker compose down -v       # 停止并清理（本项目数据在浏览器内，无服务端卷）
```

## 本地开发方式

```bash
cd frontend
npm install
npm run dev        # http://localhost:20111
npm run build      # tsc --noEmit + vite 生产构建
```

核心流程脚本测试（需要 `npm install` 后执行，仅开发依赖，不影响镜像）：

```bash
npx esbuild scripts/flow-test.ts  --bundle --platform=node --format=esm --outfile=scripts/flow-test.mjs && node scripts/flow-test.mjs
npx esbuild scripts/jsdom-test.tsx --bundle --platform=node --format=esm --external:jsdom --external:fake-indexeddb --loader:.tsx=tsx --jsx=automatic --define:process.env.NODE_ENV='"development"' --outfile=scripts/jsdom-test.mjs && node scripts/jsdom-test.mjs
```

## 访问地址或 CLI 示例

| 页面 | 路由 | 说明 |
|---|---|---|
| 学习卡片 | `/#/learn` | 点阵卡片、字符解释、按类别/难度/课程切换 |
| 练习模式 | `/#/practice` | 选择课程 → 一轮顺序练习，提交即时反馈，可错题重练 |
| 错题本 | `/#/mistakes` | 按错误原因归类、连续答对 3 次移出、手动标记掌握 |
| 学习进度 | `/#/progress` | 按课程的完成次数、正确率、最近 5 轮趋势与图表 |

前端使用 hash 路由，nginx 已配置 `try_files $uri $uri/ /index.html;`，刷新任意页面都不会 404。

## 功能与数据规则

1. **从课程开始练习**：练习页选择课程与四种模式（看点阵选字符 / 看字符选点阵 / 听写 / 混合），队列严格按 `Lesson.symbol_ids` 原顺序生成。
2. **即时反馈**：点选选项即提交，立刻展示对错徽章、正确答案、你的回答、错因归类和本题用时。
3. **本地持久化**：`PracticeSession`（会话）与每条 `AnswerRecord`（答题记录）在提交时实时写入 IndexedDB；进行中的 `PracticeDraft`（含队列、位置、模式）整体持久化，**关闭页面再打开自动恢复到同一道题、同一顺序**。
4. **错题本三振规则**（`services/mistakeService.ts`）：
   - 答错：立即进入错题本，`correct_streak = 0`；
   - 答对且在错题本：`correct_streak + 1`，达到 3 才置 `in_book=false` 移出；
   - 中途再错：立即清零（`correct_streak = 0`），重新累计；
   - 也可在错题本手动"标记掌握"直接移出。
5. **学习进度按课程**：每门课的完成次数（已结束会话数）、累计正确率、最近 5 轮完成会话的得分趋势，外加难度覆盖、分类正确率、错因分布与最近会话表。
6. **听写模拟**：使用浏览器内置 Web Speech API 朗读拼音（`utils/speech.ts`），不接入任何第三方服务。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite |
| UI | Material UI（主题/基线）+ 自定义 CSS 组件 |
| 状态管理 | Zustand 独立 store（禁止写进组件 state） |
| 本地存储 | IndexedDB（手写 Promise 封装 `api/db.ts`），首启注入 `mocks/seedData.ts` 种子 |
| 语音 | Web Speech API（SpeechSynthesis） |
| 部署 | Docker Compose + Nginx 多阶段镜像 |
| 后端 / 第三方 API | 无 |

种子数据包含 47 个点字字符（26 字母 a-z、数字 0-9、6 个常用标点、5 个英文二级点字缩略词）与 6 门递进课程。六点编号为：

```
① ④
② ⑤
③ ⑥
```

## 项目目录结构

```text
frontend/src/
├── api/                  # 按模型分文件的 async API，全部走 IndexedDB（db.ts 网关）
│   ├── db.ts             # 建库、建对象仓、种子注入
│   ├── BrailleSymbol.ts / Lesson.ts / PracticeSession.ts
│   ├── AnswerRecord.ts / MistakeState.ts / PracticeDraft.ts
├── stores/               # Zustand 独立 store
│   ├── BrailleSymbolStore.ts / LessonStore.ts
│   ├── PracticeSessionStore.ts / AnswerRecordStore.ts
│   ├── MistakeStore.ts   # 错题本计数状态机的 store 封装
│   └── PracticeStore.ts  # 开始/提交/放弃/恢复草稿、即时反馈
├── types/                # 数据模型与枚举类型
├── constants/            # 枚举文案、日志模板、错误码/错误消息、状态文案、阈值
├── constructors/         # 默认对象 / 表单对象 / 响应对象构造器
├── services/             # 判分、错题状态机、练习编排、出题选项、进度聚合
├── components/common/    # BrailleCell / LessonProgress / PracticePanel / ResultBadge /
│                         # ChartPanel / StatusBadge / StatCard / EmptyState / SymbolCard
├── hooks/                # useBraillePattern / usePracticeSession / useIndexedDbStore / useHashRoute
├── pages/                # LearnPage / PracticePage(+practice/) / MistakesPage / ProgressPage
├── router/               # routes.ts 路由表 + index.ts 路由 hook
├── utils/                # formatters / logger / errors / id / random / speech
├── mocks/                # seedData.ts 本地种子
└── scripts/              # 核心流程与 jsdom 冒烟测试
```

## 环境变量说明

| 变量 | 默认值 | 说明 |
|---|---|---|
| `COMPOSE_PROJECT_NAME` | `braille-trainer` | Compose 项目名，也作为容器名前缀 |
| `FRONTEND_PORT` | `20111` | 宿主机映射端口，容器内固定 80 |

## Docker 部署说明

- 根目录 `docker-compose.yml`：不写 `version:`，顶层 `name: braille-trainer`。
- 容器名：`${COMPOSE_PROJECT_NAME:-braille-trainer}-frontend`。
- 端口映射：`${FRONTEND_PORT:-20111}:80`。
- `frontend/Dockerfile` 为多阶段构建：Node 20 构建静态文件，Nginx 1.27 托管。
- 纯前端应用**无数据库命名卷**；用户练习数据保存在各自浏览器的 IndexedDB 中，清浏览器站点数据即重置。
- 常见问题：
  - 端口占用：改 `.env` 中 `FRONTEND_PORT` 后 `docker compose up -d`。
  - 中文目录名：构建上下文与镜像内路径均为 ASCII，工程放在任意中文目录下也可启动。
  - 语音不响：部分 Linux 无中文 TTS 语音包，听写题仍显示拼音文字提示，不影响判分。

## 枚举/常量出现位置清单

### PracticeMode（CELL_TO_TEXT / TEXT_TO_CELL / LISTENING / MIXED）

- 类型：`types/PracticeMode.ts`
- 常量与文案：`constants/PracticeMode.ts`（中文长名 + 短标签）、`constants/statusText.ts`
- 构造器：`constructors/PracticeSessionConstructor.ts`、`constructors/AnswerRecordConstructor.ts`、`constructors/PracticeDraftConstructor.ts`
- 模型字段：`PracticeSession.mode`、`AnswerRecord.mode`、`PracticeDraft.mode`
- store：`stores/PracticeStore.ts`、`stores/PracticeSessionStore.ts`
- service：`services/practiceService.ts`（创建会话/草稿）、`services/answerGrading.ts`（判分模式）、`services/questionService.ts`（MIXED 落为具体模式）
- 日志模板：`constants/logTemplates.ts`（PracticeSession.CREATE、PracticeDraft.START）
- 错误消息：`constants/errorMessages.ts`（ANSWER_MISMATCH）
- 筛选/展示：`pages/practice/LessonPicker.tsx`（模式选择器）、`components/common/PracticePanel.tsx`（模式徽章）、`pages/ProgressPage.tsx`（会话表）、`utils/formatters.ts`

### SymbolCategory（LETTER / NUMBER / PUNCTUATION / CONTRACTION）

- 类型：`types/SymbolCategory.ts`
- 常量与文案：`constants/SymbolCategory.ts`、`constants/statusText.ts`
- 构造器：`constructors/BrailleSymbolConstructor.ts`（默认 LETTER）
- 模型字段：`BrailleSymbol.category`
- store/数据：`stores/BrailleSymbolStore.ts`、`mocks/seedData.ts`
- service：`services/questionService.ts`（同类内抽干扰项）、`services/progressService.ts`（分类正确率）
- 日志模板：`constants/logTemplates.ts`（BrailleSymbol 组）
- 筛选器：`pages/LearnPage.tsx`（类别 chips、`useBraillePattern` 过滤）
- 展示组件：`components/common/SymbolCard.tsx`、`components/common/ChartPanel.tsx`（分类正确率图）、`pages/practice/PracticeStages.tsx`、`utils/formatters.ts`

### MasteryLevel（NEW / LEARNING / FAMILIAR / MASTERED，用作难度四档与掌握度）

- 类型：`types/MasteryLevel.ts`
- 常量与文案：`constants/MasteryLevel.ts`（难度文案 + 掌握度文案两套）、`constants/statusText.ts`
- 构造器：`constructors/BrailleSymbolConstructor.ts`（默认 NEW）
- 模型字段：`BrailleSymbol.difficulty`
- store/数据：`stores/BrailleSymbolStore.ts`、`mocks/seedData.ts`（47 个字符按四档标注）
- service：`services/progressService.ts`（难度分布）
- 日志模板：`constants/logTemplates.ts`（BrailleSymbol.STATUS 变更）
- 错误消息：`constants/errorMessages.ts`（VALIDATION_FAILED 时由 service 包装）
- 筛选器：`pages/LearnPage.tsx`（难度 chips）
- 展示：`components/common/SymbolCard.tsx`（难度徽章）、`components/common/ChartPanel.tsx`（难度覆盖图）、`utils/formatters.ts`

### MistakeReason（POINT_MISREAD / REVERSED_DOT / CATEGORY_MIXED / LISTENING_MISS）

- 类型：`types/MistakeReason.ts`；常量：`constants/mistakeReasons.ts`；聚合：`constants/statusText.ts`
- 构造器：`constructors/AnswerRecordConstructor.ts`
- 判分：`services/answerGrading.ts`；错题状态机：`services/mistakeService.ts`；统计：`services/progressService.ts`
- 展示/筛选：`pages/MistakesPage.tsx`（原因 chips 归类）、`components/common/ResultBadge.tsx`、`pages/practice/PracticeStages.tsx`、`utils/formatters.ts`

## 为什么该项目会牵一发动全身

- 同一枚枚举（如 PracticeMode）分散在类型、常量文案、构造器、store、service、日志模板、错误消息、筛选器、徽章和 README 中，新增一个模式需要同步至少 8 个文件。
- 每次写操作都经过 `constants/logTemplates.ts` 模板 + `utils/logger.ts`，service 抛 `ServiceError`、store 再包装 `StoreActionError`，异常消息由 `constants/errorCodes.ts` / `errorMessages.ts` 集中维护，改字段或文案要动模板、构造器与所有调用处。
- `utils/formatters.ts` 混合日期、分数、正确率、点位解析与镜像计算，被四个页面、判分服务和多个共享组件共同依赖。
- 实体按 api / store / service / constructor / types / constants / 组件 / 页面分层，最小的业务改动（如把"3 次移出"改成 4 次）也要经过阈值常量、错题服务、错题页文案与测试多处。

## License

MIT
