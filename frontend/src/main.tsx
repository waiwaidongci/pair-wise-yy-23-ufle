import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { routes } from "./router/routes";
import { navigate, useHashRoute } from "./router/hashRouter";
import { ensureSeedData } from "./services/db";
import { getErrorMessage } from "./services/errors";
import { useBrailleSymbolStore } from "./stores/BrailleSymbolStore";
import { useLessonStore } from "./stores/LessonStore";
import { usePracticeSessionStore } from "./stores/PracticeSessionStore";
import { useMistakeStore } from "./stores/MistakeStore";
import { LearnPage } from "./pages/LearnPage";
import { PracticePage } from "./pages/PracticePage";
import { MistakesPage } from "./pages/MistakesPage";
import { ProgressPage } from "./pages/ProgressPage";
import "./styles.css";

function App() {
  const { path, query } = useHashRoute();
  const [ready, setReady] = useState(false);
  const [bootError, setBootError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // 首次打开写入课程与字符种子；会话、答题、错题全部来自本地 IndexedDB
        await ensureSeedData();
        await Promise.all([
          useBrailleSymbolStore.getState().load(),
          useLessonStore.getState().load(),
          usePracticeSessionStore.getState().load(),
          useMistakeStore.getState().load()
        ]);
        if (!cancelled) setReady(true);
      } catch (error) {
        if (!cancelled) setBootError(getErrorMessage(error));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (bootError) {
    return (
      <main className="boot">
        <div className="error-banner" role="alert">{bootError}</div>
      </main>
    );
  }
  if (!ready) return <main className="boot"><p>正在加载本地练习数据…</p></main>;

  return (
    <div className="shell">
      <aside>
        <div className="brand">盲文点字学习训练器</div>
        <nav>
          {routes.map((route) => (
            <button
              key={route.route}
              className={path === route.route ? "active" : ""}
              onClick={() => navigate(route.route)}
            >
              {route.name}
            </button>
          ))}
        </nav>
        <p className="aside-note">数据保存在浏览器 IndexedDB，关闭页面不丢失。</p>
      </aside>
      {path === "/practice" ? (
        <PracticePage query={query} />
      ) : path === "/mistakes" ? (
        <MistakesPage />
      ) : path === "/progress" ? (
        <ProgressPage />
      ) : (
        <LearnPage />
      )}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
