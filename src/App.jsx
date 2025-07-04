import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AppRouter from "./routes/AppRouter";
import { ThemeContext } from "./utils/themeContext";
import Header from "./components/main/Header";
import ChatModal from "./pages/Chat/ChatModal";
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

  return (
    <ThemeContext.Provider value={{isDark, setIsDark}}>
      <div className="app-container">
        <Header onOpenChat={openChatModal} ></Header>
        <main className="main-container">
        <ScrollToTop />
        <AppRouter/>
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