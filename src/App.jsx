import { useState, useEffect } from "react";
import { useLocation, Routes, Route } from "react-router-dom";
import AppRouter from "./routes/AppRouter";
import { ThemeContext } from "./utils/themeContext";
import Header from "./components/main/Header";
import ChatModal from "./pages/Chat/ChatModal";
import FeedDetail from "./components/feed/FeedDetail";
import './App.css';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {

  // 다크모드 - useContext를 이용하여 prop 전달
  const [isDark, setIsDark] = useState(false);
  // 채팅
  const [isChatModal, setIsChatModal] = useState(false);
  const openChatModal = () => setIsChatModal(true);
  const closeChatModal = () => setIsChatModal(false);

  const location = useLocation();
  const state = location.state && location.state.backgroundLocation;

  return (
    <ThemeContext.Provider value={{isDark, setIsDark}}>
      <div className="app-container">
        <Header onOpenChat={openChatModal} ></Header>
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
          chatId={1} // 필요한 채팅방 ID
        />
        </main>
      </div>
    </ThemeContext.Provider>
  );
}

export default App;