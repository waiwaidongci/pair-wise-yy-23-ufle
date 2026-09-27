# 盲文点字学习训练器（braille-trainer）

纯前端盲文点字学习与练习工具：从课程选择题字字符开始练习，提交答案立即看到对错结果，会话与每道答题记录保存在浏览器 IndexedDB；答错的字符自动进入错题本，同一字符连续答对 3 次后移出，中途再错则从零计数；学习进度按课程展示完成次数、正确率与最近趋势，关闭页面再打开仍能看到原来的练习顺序和错题状态。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

启动后访问：<http://localhost:20111>

停止服务：

```bash
docker compose down
```

> 本项目为纯前端应用，没有服务端数据库：课程与字符种子随镜像分发，练习会话、答题记录、错题本全部保存在浏览器的 IndexedDB 中，因此不使用 Docker 命名卷，更换浏览器或清除站点数据会重置学习记录。

## 本地开发方式

```bash
cd frontend
npm install
npm run dev        # http://localhost:20111
```

构建与本地预览：

```bash
npm run build
npm run preview
```

## 功能说明

### 练习流程（练习模式 `/practice`）

1. 在练习页选择课程（5 个课程，覆盖 a–z、数字与数字号、标点与常用连写）和题型：
   - **看形识字 CELL_TO_TEXT**：看六点盲符选字符
   - **看字选点 TEXT_TO_CELL**：看字符选盲符
   - **听音辨字 LISTENING**：通过 Web Speech API 播放读音（不支持语音的浏览器会显示拼音提示）
   - **混合训练 MIXED**：三种题型按顺序轮换
2. 点击候选项即提交，**立刻显示结果**：对错徽标、你的答案、正确答案（字符 + 点阵 + 拼音）、错误原因与本题用时。答错的选项标红、正确选项标绿，按 Enter 或按钮进入下一题。
3. 一轮结束显示得分、答对数、错题数与用时，可「再练一轮」或返回课程选择。
4. 中途「结束本轮」会把会话标记为 ABANDONED；直接关闭页面则会话保持 ACTIVE，题目顺序（洗牌后的符号序列）、当前下标、题型轮换状态都已持久化，下次打开可在「继续上次练习」中原序继续。

### 错题本（`/mistakes`）

- 答错的字符**立刻进入错题本**，记录错误原因（字符认错 / 点位选错 / 听辨失误）、累计错误次数与最近错误时间。
- **同一字符连续答对 3 次自动移出**；中途只要再错一次，计数立即清零重新开始。
- 可按错误原因筛选、「标记掌握」立即移出，也可一键开始「错题重练」（仅含错题本中仍待攻克的字符，自动采用混合题型）。
- 已移出的字符保留在「已移出错题本」折叠区，状态为已掌握。

### 学习卡片（`/learn`）

- 按课程浏览真实六点盲符卡片（左列点位 1/2/3、右列 4/5/6）、字符、拼音、分类、难度与掌握度；可按难度筛选、点击「听发音」。

### 学习进度（`/progress`）

- **按课程**展示完成次数（仅统计已结束会话）、进行中轮数、答题数、正确率与最近一次练习时间。
- 每门课程一张最近正确率走势图（最近 8 轮）与「上升 / 下降 / 持平」趋势结论。
- 全局限总完成轮数、累计答题数、总正确率、待攻克错题数，并展示字符掌握度（NEW / LEARNING / FAMILIAR / MASTERED）分布和各难度正确率。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite 5 |
| UI | Material UI（依赖安装）+ 项目自研样式组件 |
| 状态管理 | Zustand（每个实体独立 store） |
| 本地存储 | IndexedDB（课程/字符首次打开写入种子） |
| 语音 | Web Speech API（可选，失败降级为拼音提示） |
| 部署 | Docker Compose + Nginx 多阶段镜像 |
| 后端 | 无（禁止第三方 API，所有数据均在本地） |

## 项目目录结构

```text
frontend/src/
├── api/                  # 按模型分文件的 async API（IndexedDB 封装 + 写日志）
│   ├── BrailleSymbol.ts
│   ├── Lesson.ts
│   ├── PracticeSession.ts
│   ├── AnswerRecord.ts
│   └── MistakeEntry.ts
├── stores/               # Zustand 独立 store
│   ├── BrailleSymbolStore.ts
│   ├── LessonStore.ts
│   ├── PracticeSessionStore.ts   # 练习编排：会话 + 答题记录 + 错题本联动
│   ├── AnswerRecordStore.ts
│   └── MistakeStore.ts
├── types/                # 数据模型类型
├── constants/            # 枚举、日志模板、错误码、错误消息、状态文案
├── constructors/         # 默认对象 / 表单对象 / 响应对象构造器
├── components/common/    # BrailleCell / LessonProgress / PracticePanel /
│                         # ResultBadge / ChartPanel / StatusBadge / ...
├── hooks/                # useBraillePattern / usePracticeSession / useIndexedDbStore
├── pages/                # 4 个路由页面：Learn / Practice / Mistakes / Progress
├── router/               # routes.ts 路由表 + hashRouter.ts
├── services/             # IndexedDB 封装、错题规则、练习引擎、进度统计、日志、错误
├── utils/                # formatters.ts（日期/百分比/耗时/枚举文案/趋势）
└── mocks/                # 45 个真实盲文字符与 5 个课程的种子数据
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`：Compose 项目名，默认 `braille-trainer`，同时作为容器名前缀。
- `FRONTEND_PORT`：前端宿主机端口，默认 `20111`，映射到容器 80。

## Docker 部署说明

- 根目录 `docker-compose.yml`：不写 `version` 字段，顶层 `name: braille-trainer`，只编排 `frontend` 一个服务。
- 容器名：`${COMPOSE_PROJECT_NAME:-braille-trainer}-frontend`。
- 端口映射：`${FRONTEND_PORT:-20111}:80`。
- `frontend/Dockerfile` 为多阶段构建：Node 20 构建静态资源，Nginx 1.27 托管；`nginx.conf` 配置 `try_files $uri $uri/ /index.html;` 支持 SPA 路由。
- 常见问题：
  - 端口被占用：修改根目录 `.env` 中的 `FRONTEND_PORT` 后重新 `docker compose up -d`。
  - 在任意目录名（含中文目录名）下均可构建启动，构建阶段不依赖宿主路径，运行时数据位于浏览器中。
  - 想清空学习记录：在浏览器站点设置里清除 IndexedDB（没有 `down -v` 的服务端卷需要处理）。

## 枚举/常量出现位置清单

### PracticeMode（CELL_TO_TEXT / TEXT_TO_CELL / LISTENING / MIXED）

- 常量定义与中文文案：`constants/PracticeMode.ts`（含 `PracticeModeText`、`PracticeModeHint`）
- 类型再导出：`types/PracticeMode.ts`、`types/PracticeSession.ts`（会话 mode）、`types/AnswerRecord.ts`（答题 mode）
- 聚合文案：`constants/statusText.ts`
- 构造器：`constructors/PracticeSessionConstructor.ts`（新会话默认题型）、`constructors/AnswerRecordConstructor.ts`（答题记录题型）
- 练习引擎（轮换与判分）：`services/practiceEngine.ts`
- store：`stores/PracticeSessionStore.ts`
- 日志/错误：所有会话与答题写操作经 `constants/logTemplates.ts` 的模板输出；空课程等错误经 `constants/errorCodes.ts` + `constants/errorMessages.ts`
- 展示与筛选：`pages/PracticePage.tsx`（题型选择卡片、题目标题）、`utils/formatters.ts`（`formatPracticeMode`）

### SymbolCategory（LETTER / NUMBER / PUNCTUATION / CONTRACTION）

- 常量定义与中文文案：`constants/SymbolCategory.ts`
- 类型再导出：`types/SymbolCategory.ts`、`types/BrailleSymbol.ts`
- 聚合文案：`constants/statusText.ts`
- 种子数据：`mocks/seedData.ts`（每个字符带分类）
- 构造器：`constructors/BrailleSymbolConstructor.ts`（默认 LETTER）
- 练习引擎候选项：`services/practiceEngine.ts`（同分类字符优先作为干扰项）
- 筛选与展示：`pages/LearnPage.tsx`（分类徽标）、`pages/MistakesPage.tsx`（分类徽标）、`utils/formatters.ts`（`formatCategory`）

### MasteryLevel（NEW / LEARNING / FAMILIAR / MASTERED）

- 常量定义与中文文案：`constants/MasteryLevel.ts`
- 类型再导出：`types/MasteryLevel.ts`、`types/MistakeEntry.ts`
- 聚合文案：`constants/statusText.ts`
- 构造器：`constructors/MistakeEntryConstructor.ts`（默认 LEARNING）
- 错题规则：`services/mistakeService.ts`（连对升级、3 次后 MASTERED）
- 进度统计：`services/progressService.ts`（按字符计算掌握度与计数）
- 展示：`pages/LearnPage.tsx`（卡片掌握度徽标）、`pages/ProgressPage.tsx`（掌握度分布）、`pages/MistakesPage.tsx`（已掌握徽标）、`utils/formatters.ts`（`formatMastery`）

### 其它配套枚举

- `DifficultyLevel`（EASY/MEDIUM/HARD）：`constants/DifficultyLevel.ts`、`types/BrailleSymbol.ts`、`mocks/seedData.ts`、`constructors/BrailleSymbolConstructor.ts`、`services/progressService.ts`（难度分布）、`pages/LearnPage.tsx`（难度筛选）、`utils/formatters.ts`
- `MistakeReason`（WRONG_CHARACTER/WRONG_PATTERN/LISTEN_MISS）：`constants/MistakeReason.ts`、`types/AnswerRecord.ts`、`types/MistakeEntry.ts`、`services/practiceEngine.ts`（按题型判定原因）、`services/mistakeService.ts`、`pages/MistakesPage.tsx`（原因筛选）、`utils/formatters.ts`
- `SessionStatus`（ACTIVE/FINISHED/ABANDONED）：`constants/SessionStatus.ts`、`types/PracticeSession.ts`、`stores/PracticeSessionStore.ts`、`services/progressService.ts`、`utils/formatters.ts`
- `ReviewSource`（LESSON/MISTAKE_REVIEW）：`constants/ReviewSource.ts`、`types/PracticeSession.ts`、`stores/PracticeSessionStore.ts`、`pages/PracticePage.tsx`、`utils/formatters.ts`

## 为什么该项目会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、服务规则、store、筛选器与展示组件被刻意拆分在多个目录，且跨层直接引用：

- 改一个题型或状态枚举值，需要同步常量、类型、构造器、引擎判分、store 会话字段、页面筛选/展示与 `utils/formatters.ts` 的文案。
- 改错题规则（例如把 3 次改成 5 次），要同时动 `services/mistakeService.ts` 的计数/移出逻辑、`constants/logTemplates.ts` 的日志语义、错题本页面的 3 格指示与练习页反馈提示。
- 每道题的提交链路横跨 `PracticePanel` 页面 → `usePracticeSession` hook → `PracticeSessionStore` → `AnswerRecord` 构造器/API、`MistakeStore` → `MistakeEntry` 构造器/规则/API，任一字段变更都会向上影响即时反馈与进度统计。
- `utils/formatters.ts` 混合日期、百分比、耗时、风险与全部枚举文案，被 4 个页面共同依赖；日志、错误码、错误消息也分别独立成文件被 api/service/store 多层包装引用。

## License

MIT
