import React from 'react';
import styles from './ModalUserList.module.css';
import { useNavigate } from 'react-router-dom';


const ModalUserList = ({ 
  isOpen, 
  onClose, 
  title = "여행자 목록", 
  inProgressUsers = [], 
  completedUsers = [], 
  awardedUsers = [], 
  type // 'quest' 또는 'badge'
}) => {

      const navigate = useNavigate();
    
  
  const handleUserClick = (userId) => {
    console.log(userId);
    //#NeedToChange
  };

  const renderUserRow = (user) => (
    <div 
      key={user.user_id} 
      className={styles.userRow}
      onClick={() => handleUserClick(user.user_id)}
    >
      <div className={styles.userImage}>
        {user.profile_image ? (
          <img src={user.profile_image} alt={user.nickname} />
        ) : (
          <img src="/icons/common/user_profile.svg" alt={user.nickname} />
        )}
      </div>
      <div className={styles.userId}>{user.user_id}</div>
      <div className={styles.userNickname}>{user.nickname}</div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.userListModal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <img src="/icons/common/close.svg" alt="close" />
          </button>
        </div>
        
        <div className={styles.modalContent}>
          {type === 'quest' && (
            <>
              {/* 진행 중인 여행자들 */}
              {inProgressUsers.length > 0 && (
                <div className={styles.userSection}>
                  <h3 className={styles.sectionTitle}>
                    이 퀘스트를 진행중인 여행자들 ({inProgressUsers.length})
                  </h3>
                  <div className={styles.userList}>
                    {inProgressUsers.map(renderUserRow)}
                  </div>
                </div>
              )}

              {/* 완료한 여행자들 */}
              {completedUsers.length > 0 && (
                <div className={styles.userSection}>
                  <h3 className={styles.sectionTitle}>
                    이 퀘스트를 완료한 여행자들 ({completedUsers.length})
                  </h3>
                  <div className={styles.userList}>
                    {completedUsers.map(renderUserRow)}
                  </div>
                </div>
              )}
            </>
          )}

          {type === 'badge' && (
            <div className={styles.userSection}>
              <h3 className={styles.sectionTitle}>
                이 뱃지를 획득한 여행자들 ({awardedUsers.length})
              </h3>
              <div className={styles.userList}>
                {awardedUsers.length > 0 ? (
                  awardedUsers.map(renderUserRow)
                ) : (
                  <div className={styles.noUsers}>아직 획득한 여행자가 없습니다.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalUserList;