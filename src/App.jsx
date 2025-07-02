import {useState} from "react";
import AppRouter from "./routes/AppRouter";
import Header from "./components/main/Header";
import ChatModal from "../pages/chat/ChatModal";
import './App.css';

function App() {
  const [isChatModal, setIsChatModal] = useState(false); // 채팅 모달 상태
  const openChatModal = () => setIsChatModal(true);
  const closeChatModal = () => setIsChatModal(false);
  return (
    <div className="app-container">
      <Header onOpenChat={openChatModal} ></Header>
      <main className="main-container">
      <AppRouter/>
      <ChatModal
        isOpen={isChatModal}
        onClose={closeChatModal}
        chatId={1} // 필요한 채팅방 ID
        senderId="ccc" // 현재 사용자 ID
      />
      </main>
    </div>
  );
}

export default App;