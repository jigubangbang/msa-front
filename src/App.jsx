import { useState, useEffect } from "react";
import { useLocation, useNavigate, Routes, Route } from "react-router-dom";
import AppRouter from "./routes/AppRouter";
import { ThemeContext } from "./utils/themeContext";
import Header from "./components/main/Header";
import Footer from "./components/main/Footer";
import ChatModal from "./pages/chat/ChatModal";
import FeedDetail from "./components/feed/FeedDetail";
import "./App.css";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const [isDark, setIsDark] = useState(false); // 다크모드

  // 이제 지워야 할 부분
  const [isChatModal, setIsChatModal] = useState(false); // 채팅

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isLoginPage = location.pathname === "/login";
    const sessionExpired = localStorage.getItem("sessionExpired") === "true";

    if (sessionExpired && !isLoginPage) {
      localStorage.removeItem("sessionExpired");
      navigate("/login", { replace: true });
    }
  }, [location, navigate]);

  const openChatModal = () => setIsChatModal(true);
  const closeChatModal = () => setIsChatModal(false);
  // 아래 <ChatModal/>을 아예 제거해야 함.


  const state = location.state && location.state.backgroundLocation;

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      <div className="app-container">
        <Header onOpenChat={openChatModal} />
        <main className="main-container">
          <ScrollToTop />

          <Routes location={state || location}>
            <Route path="/*" element={<AppRouter />} />
          </Routes>

          {state && (
            <Routes>
              <Route path="/feed/:feedId" element={<FeedDetail />} />
            </Routes>
          )}

          {isChatModal && <ChatModal isOpen={isChatModal} onClose={closeChatModal} chatId={1} />}
        </main>
        <Footer />
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
