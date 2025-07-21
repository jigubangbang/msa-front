import React, { useState } from 'react';
import styles from './BadgeModal.module.css';
import { useNavigate } from 'react-router-dom';
import ModalUserList from '../ModalUserList/ModalUserList';
import TrophyIcon from '../../../assets/quest/trophy.svg'; 


const BadgeModal = ({ badgeData, onClose, onQuestClick, isLogin = false }) => {
  const [showUserList, setShowUserList] = useState(false);

  const navigate = useNavigate();


  // 난이도 숫자 -> 한글
  const getDifficultyText = (difficulty) => {
    switch(difficulty) {
      case '1': return '초급';
      case '2': return '중급';
      case '3': return '고급';
      case '4': return '시즌 한정 뱃지';
      default: return difficulty;
    }
  };

  // 날짜 포맷
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  // 퀘스트 진행률 계산
  const calculateProgress = () => {
    if (badgeData.total_quest === 0) return 0;
    return Math.round((badgeData.completed_quest / badgeData.total_quest) * 100);
  };

  // 퀘스트 클릭 핸들러
  const handleQuestClick = (quest) => {
    if (onQuestClick) {
      onQuestClick(quest.id);
    }
  };

  // 유저 목록 클릭
  const handleUserListClick = () => {
    setShowUserList(true);
    // console.log('뱃지 획득자들:', badgeData.awarded_user);
  };

  // 유저 아바타 렌더링
  const renderUserAvatars = (users) => {
    const displayUsers = users.slice(0, 3);
    const remainingCount = users.length - 3;

    return (
      <div 
        className={styles.userAvatars}
        onClick={handleUserListClick}
      >
        <div className={styles.avatarList}>
          {displayUsers.map((user, index) => (
            <div key={user.user_id} className={styles.avatar} style={{ zIndex: 3 - index }}>
              {user.profile_image ? (
                <img src={user.profile_image} alt={user.nickname} />
              ) : (
                <img src="/icons/common/default_profile.png" alt={user.nickname} />
              )}
            </div>
          ))}
          {remainingCount > 0 && (
            <div className={`${styles.avatar} ${styles.remainingCount}`} style={{ zIndex: 0 }}>
              +{remainingCount}
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleLoginClick = () => {
    window.scrollTo(0, 0);
    navigate('/login');
  };

  const handleSignupClick = () => {
    window.scrollTo(0, 0);
    navigate('/register');
  };

  // 퀘스트 리스트 렌더링
  const renderQuestList = () => {
    if (!badgeData.quest_list || badgeData.quest_list.length === 0) {
      return <div className={styles.noQuests}>연관된 퀘스트가 없습니다.</div>;
    }

    return (
      <div className={styles.questList}>
        {badgeData.quest_list.map((quest, index) => (
          <div 
            key={quest.id} 
            className={styles.questItem}
            onClick={() => handleQuestClick(quest)}
          >
            <div className={styles.questNumber}>{quest.id}</div>
            <div className={styles.questInfo}>
              <span className={styles.questTitle}>{quest.title}</span>
            </div>
            <div className={styles.questStatus}>
              <div className={styles.questIcon}></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 상태별 버튼 렌더링
  const renderStatusSection = () => {
    console.log(badgeData);
    if (!isLogin) {
      return (
        <div className={styles.statusSection}>
          <span className={styles.statusText}>
            지구방방에 로그인 시 뱃지 진행상황을 확인할 수 있습니다.
          </span>
          <div className={styles.buttonGroup}>
                <button className={styles.challengeBtn} onClick={handleLoginClick}>
                  로그인
                </button>
                <button className={styles.giveUpBtn} onClick={handleSignupClick}>
                  회원가입
                </button>
              </div>
        </div>
      );
    }

    if (badgeData.is_awarded) {
      return (
        <div className={styles.statusSection}>
          <div className={styles.awardedBadge}><img src={TrophyIcon} alt="trophy" className={styles.trophyIcon} /></div>
          <span className={styles.statusText}>
            축하합니다! {formatDate(badgeData.awarded_at)}에 뱃지를 획득했습니다
          </span>
        </div>
      );
    }else{
      return (
          <div className={styles.statusSection}>
            <div className={styles.progressInfo}>
              <span className={styles.progressText}>
                진행률: {badgeData.completed_quest}/{badgeData.total_quest} ({calculateProgress()}%)
              </span>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
            </div>
          </div>
        );
    }

    
  };

  if (!badgeData) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.badgeModal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className={styles.modalContent}>
          <div className={styles.modalLayout}>
            {/* 왼쪽 열 */}
            <div className={styles.leftColumn}>
              {/* 뱃지 아이콘 */}
              <div className={styles.badgeSection}>
                <div className={styles.badgeContainer}>
                  <img 
                    src={badgeData.icon} 
                    alt="badge" 
                    className={styles.badgeIcon}
                  />
                </div>
              </div>

              {/* 제목 */}
              <div className={styles.titleSection}>
                <h2 className={styles.badgeKorTitle}>{badgeData.kor_title}</h2>
                <p className={styles.badgeEngTitle}>{badgeData.eng_title}</p>
              </div>
              
              {/* 난이도 */}
              <div className={styles.badgeMeta}>
                <span className={styles.difficulty}>{getDifficultyText(badgeData.difficulty)}</span>
              </div>

              {/* 설명 */}
              <div className={styles.badgeDescription}>
                {badgeData.description}
              </div>

            </div>
            
            {/* 오른쪽 열 */}
            <div className={styles.rightColumn}>
              <div className={styles.userSection}>
                <div className={styles.sectionTitle}>
                  이 뱃지를 획득한 여행자들 ({badgeData.count_awarded})
                </div>
                {badgeData.awarded_user && badgeData.awarded_user.length > 0 ? (
                  renderUserAvatars(badgeData.awarded_user)
                ) : (
                  <div className={styles.noUsers}>아직 획득한 여행자가 없습니다.</div>
                )}
              </div>

              {/* 상태 섹션 */}
              {renderStatusSection()}
              
              {/* 퀘스트 목록 */}
              <div className={styles.questSection}>
                <div className={styles.sectionTitle}>
                  연관 퀘스트 ({badgeData.total_quest})
                </div>
                {renderQuestList()}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showUserList && (
        <ModalUserList
          isOpen={showUserList}
          onClose={() => setShowUserList(false)}
          type="badge"
          awardedUsers={badgeData.awarded_user || []}
        />
      )}
    </div>
  );
};

export default BadgeModal;