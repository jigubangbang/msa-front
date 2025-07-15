import { useState, useEffect } from "react";
import { useLocation, useNavigate, Routes, Route } from "react-router-dom";
import AppRouter from "./routes/AppRouter";
import { ThemeContext } from "./utils/themeContext";
import { ChatProvider } from "./utils/ChatContext";
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
  const [isChatModal, setIsChatModal] = useState(false);

  const [currentChatId, setCurrentChatId] = useState(1);

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

  // 채팅방 열기 함수 (여러 채팅방 지원)
  const openChatModal = (chatId = 1) => {
    console.log(`[App] 채팅방 열기: ${chatId}`);
    setCurrentChatId(chatId);
    setIsChatModal(true);
  };
  
  // 채팅방 닫기
  const closeChatModal = () => {
    console.log(`[App] 채팅방 닫기: ${currentChatId}`);
    setIsChatModal(false);
  };

  const state = location.state && location.state.backgroundLocation;

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      <ChatProvider>
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

          <ChatModal 
            isOpen={isChatModal} 
            onClose={closeChatModal} 
            chatId={4} 
          />

          </main>
          <Footer />
        </div>
      </ChatProvider>
    </ThemeContext.Provider>
  );
}

export default App;
