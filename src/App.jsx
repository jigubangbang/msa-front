import { useState, useEffect } from "react";
import { useLocation, useNavigate, Routes, Route } from "react-router-dom";
import AppRouter from "./routes/AppRouter";
import { ThemeContext } from "./utils/themeContext";
import { ChatProvider, useChatContext } from "./utils/ChatContext";
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

function AppContent() {
  const [isDark, setIsDark] = useState(false); // 다크모드
  const { chatRooms, openChat, closeAllChats } = useChatContext();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleForceLogout = () => {
      console.log('[App] 강제 로그아웃 감지 - 모든 채팅방 정리');
      closeAllChats();
    };

    window.addEventListener('forceLogout', handleForceLogout);

    return () => {
      window.removeEventListener('forceLogout', handleForceLogout);
    };
  }, [closeAllChats]);

  useEffect(() => {
    const isLoginPage = location.pathname === "/login";
    const sessionExpired = localStorage.getItem("sessionExpired") === "true";

    if (sessionExpired && !isLoginPage) {
      localStorage.removeItem("sessionExpired");
      navigate("/login", { replace: true });
    }
  }, [location, navigate]);
  
  const state = location.state && location.state.backgroundLocation;

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
        <div className="app-container">
          <Header/>
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

             {Object.entries(chatRooms).map(([chatId, chatData]) => (
              chatData.isOpen && (
                <ChatModal
                  key={chatId}
                  isOpen={chatData.isOpen}
                  onClose={chatData.onClose} 
                  chatId={chatId}
                  currentUserId={chatData.currentUserId}
                  onLeave={chatData.onLeave}
                />
              )
          ))}

          </main>
          <Footer />
        </div>
    </ThemeContext.Provider>
  );
}

function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}

export default App;
