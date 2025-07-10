import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppRouter from "./routes/AppRouter";
import { ThemeContext } from "./utils/themeContext";
import Header from "./components/main/Header";
import ChatModal from "./pages/Chat/ChatModal";
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

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      <div className="app-container">
        <Header onOpenChat={openChatModal} />
        <main className="main-container">
          <ScrollToTop />
          <AppRouter />
          <ChatModal
            isOpen={isChatModal}
            onClose={closeChatModal}
            chatId={1}
          />
        </main>
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
