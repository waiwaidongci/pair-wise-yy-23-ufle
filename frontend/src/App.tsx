import { useEffect, useMemo } from "react";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { ensureSeeded } from "./api/db";
import { useHashRoute } from "./hooks/useHashRoute";
import { routes, defaultRoute } from "./router/routes";
import { usePracticeStore } from "./stores/PracticeStore";
import { useMistakeStore } from "./stores/MistakeStore";
import { LearnPage } from "./pages/LearnPage";
import { PracticePage } from "./pages/PracticePage";
import { MistakesPage } from "./pages/MistakesPage";
import { ProgressPage } from "./pages/ProgressPage";
import "./styles.css";

const theme = createTheme({
  palette: {
    primary: { main: "#223126" },
    secondary: { main: "#d39b46" },
    background: { default: "#eef1e8", paper: "#fbfaf4" },
    success: { main: "#2e7d4f" },
    warning: { main: "#b7791f" },
    error: { main: "#c0392b" }
  },
  typography: {
    fontFamily: `"PingFang SC", "Microsoft YaHei", system-ui, sans-serif`
  },
  shape: { borderRadius: 8 }
});

function App() {
  const [route, navigate] = useHashRoute();
  const current = routes.find((item) => item.route === route) ?? routes.find((r) => r.route === defaultRoute)!;

  const draft = usePracticeStore((s) => s.draft);
  const mistakeCount = useMistakeStore((s) => s.rows.filter((row) => row.in_book).length);
  const bootstrapPractice = usePracticeStore((s) => s.bootstrap);
  const loadMistakes = useMistakeStore((s) => s.load);

  // 启动时灌入种子数据，恢复未完成练习草稿与错题本徽标
  useEffect(() => {
    void ensureSeeded()
      .then(() => Promise.all([bootstrapPractice(), loadMistakes()]))
      .catch(() => undefined);
  }, [bootstrapPractice, loadMistakes]);

  const page = useMemo(() => {
    switch (current.route) {
      case "/learn":
        return <LearnPage />;
      case "/practice":
        return <PracticePage />;
      case "/mistakes":
        return <MistakesPage />;
      case "/progress":
        return <ProgressPage />;
      default:
        return <LearnPage />;
    }
  }, [current.route]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="shell">
        <aside>
          <div className="brand">
            盲文点字
            <br />
            学习训练器
          </div>
          <p className="brand-sub">braille-trainer</p>
          <nav>
            {routes.map((item) => (
              <button
                key={item.route}
                className={current.route === item.route ? "active" : ""}
                onClick={() => navigate(item.route)}
              >
                <span>{item.name}</span>
                {item.route === "/practice" && draft && <em className="nav-dot" title="有进行中的练习" />}
                {item.route === "/mistakes" && mistakeCount > 0 && <em className="nav-count">{mistakeCount}</em>}
              </button>
            ))}
          </nav>
          <p className="aside-hint">数据保存在本机 IndexedDB，关闭页面再打开练习与错题状态仍在。</p>
        </aside>
        <main className="page">{page}</main>
      </div>
    </ThemeProvider>
  );
}

export default App;
