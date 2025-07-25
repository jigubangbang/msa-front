// src/components/chat/ChatDescriptionEditor.jsx
import React, {useState} from 'react';
import API_ENDPOINTS from '../../utils/constants';
import api from '../../apis/api';
import edit_grey from '../../assets/profile/edit_grey.svg';
import "../../styles/Chat/ChatDescriptionEditor.css";

export default function ChatDescriptionEditor({ description, setDescription, chatId, isManager, showAlert, refetch }) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempDesc, setTempDesc] = useState(description);

    // 채팅방 설명 수정
    const updateDescription = async () => {
        try {
            await api.put(`${API_ENDPOINTS.CHAT}/${chatId}/description`, { 
                description: tempDesc
            });
            await refetch();
            
            setDescription(tempDesc);
            setIsEditing(false);
            showAlert("성공", "채팅방 설명이 수정되었습니다.", 'bottom');
        } catch (err) {
            console.error("설명 수정 실패:", err);
            showAlert("오류", "채팅방 설명 수정에 실패했습니다.", 'bottom');
        }
    };

  return (
    <>
        <div className="sidebar-header">
            <h3>채팅방 정보</h3>
            {isManager && (
              <button className="edit-button" onClick={() => setIsEditing(true)}>
                <img src={edit_grey}/>
              </button>
            )}
        </div>
        <div className="sidebar-section chat-info-section">
        {isEditing ? (
            <div>
            <textarea
                value={tempDesc}
                onChange={(e) => setTempDesc(e.target.value)}
                rows={3}
                style={{ width: '100%' }}
            />
            <button className="desc-button" onClick={updateDescription}>저장</button>
            <button className="desc-button" onClick={() => {
                    setIsEditing(false);
                    setTempDesc(description);
                }}>취소</button>
            </div>
        ) : (
            <>
            <p style={{ whiteSpace: 'pre-wrap' }}>{description || "아직 채팅방 정보를 작성하지 않았습니다."}</p>
            </>
        )}
        </div>
    </>
  );
}