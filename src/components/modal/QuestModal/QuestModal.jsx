import React, { useState } from 'react';
import styles from './QuestModal.module.css';
import { useNavigate } from 'react-router-dom';
import ModalUserList from '../ModalUserList/ModalUserList';
import QuestActionModal from '../QuestActionModal/QuestActionModal';
import QuestCertificationModal from '../QuestCertificationModal/QuestCertificationModal';
import QuestCertificationViewModal from '../QuestCertificationViewModal/QuestCertificationViewModal';


const QuestModal = ({ 
  questData, 
  onClose, 
  isLogin=false, 
  onBadgeClick,
  onQuestUpdate,
  currentUserId }) => {
  const [badgeHover, setBadgeHover] = useState(null);
const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);
  const [showUserList, setShowUserList] = useState(false);

  const [actionModal, setActionModal] = useState({
  isOpen: false,
  type: null
});

  const [CertiViewModal, setCertiViewModal] = useState({
    isOpen: false,
    questUserId: null
  })

const [isCertiModalOpen, setIsCertiModalOpen] = useState(false);

  const navigate = useNavigate();

  // 난이도 영어 -> 한글
  const getDifficultyText = (difficulty) => {
    switch(difficulty) {
      case 'EASY': return '초급';
      case 'MEDIUM': return '중급';
      case 'HARD': return '고급';
      default: return difficulty;
    }
  };

  // 유니코드-> 이모지
  const convertUnicodeToEmoji = (text) => {
    try {
      return JSON.parse(`"${text}"`);
    } catch {
      return text;
    }
  };

  // 날짜 포맷
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  // Progress 계산
  const calculateCompletionRate = () => {
    const total = questData.count_in_progress + questData.count_completed;
    if (total === 0) return 0;
    return Math.round((questData.count_completed / total) * 100);
  };

  // 배지 클릭 
  const handleBadgeClick = (badge, index) => {
    if (index === currentBadgeIndex) {
      if (onBadgeClick) {
        onBadgeClick(badge.id);
      }
    } else {
      setCurrentBadgeIndex(index);
    }
  };

const renderBadges = () => {
  if (!questData.badges || questData.badges.length === 0) {
    return <div className={styles.noBadges}>연관된 뱃지가 없습니다.</div>;
  }

  const currentBadge = questData.badges[currentBadgeIndex];

  return (
    <div className={styles.badgesContainer}>
      <div className={styles.badgeCarousel}>
        {questData.badges.map((badge, index) => {
          const isActive = index === currentBadgeIndex;
          const isLeft = index < currentBadgeIndex;
          const isRight = index > currentBadgeIndex;
          
          let position = '';
          if (isActive) position = styles.activeBadge;
          else if (isLeft) position = styles.leftBadge;
          else if (isRight) position = styles.rightBadge;

          return (
            <div 
              key={badge.id}
              className={`${styles.badgeContainer} ${position}`}
              onMouseEnter={() => isActive && setBadgeHover(badge.id)}
              onMouseLeave={() => setBadgeHover(null)}
              onClick={() => handleBadgeClick(badge, index)}
            >
              <img 
                src={badge.icon} 
                alt="badge" 
                className={styles.badgeIcon}
                style={{ opacity: badgeHover === badge.id ? 0.7 : 1 }}
              />
              {badgeHover === badge.id && isActive && (
                <div className={styles.badgeTooltip}>
                  <div className={styles.badgeKorTitle}>{badge.kor_title}</div>
                  <div className={styles.badgeEngTitle}>{badge.eng_title}</div>
                  <div className={styles.badgeClickHint}>클릭하여 뱃지 보기</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* 배지 인디케이터 */}
      {questData.badges.length > 1 && (
        <div className={styles.badgeIndicators}>
          {questData.badges.map((_, index) => (
            <div 
              key={index}
              className={`${styles.indicator} ${index === currentBadgeIndex ? styles.activeIndicator : ''}`}
              onClick={() => setCurrentBadgeIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

  // 유저 목록 클릭 
  const handleUserListClick = (type) => {
    setShowUserList(true);
  };

  // 버튼들
  const handleChallengeClick = () => {
      setActionModal({
    isOpen: true,
    type: 'challenge'
  });
  };

  const handleVerifyClick = async() => {
    if (questData.status=="INACTIVE"){
      setActionModal({
        isOpen: true,
        type: 'season_end'
      });
      return;
    }
    setIsCertiModalOpen(true);
  };

  const handleGiveUpClick = () => {
    const actionType = questData.status === "INACTIVE" ? 'season_end' : 'abandon';
    setActionModal({
      isOpen: true,
      type: actionType
    });
  };

  const handleViewCertificationClick = () => {
    setCertiViewModal({
      isOpen: true,
      questUserId: questData.quest_user_id
    })
  };

  const handleRetryClick = () => {
    setActionModal({
    isOpen: true,
    type: 'retry'
  });
  };

  const handleLoginClick = () => {
    window.scrollTo(0, 0);
    navigate('/login');
  };

  const handleSignupClick = () => {
    window.scrollTo(0, 0);
    navigate('/register');
  };

  const handleActionModalClose = () => {
  setActionModal({
    isOpen: false,
    type: null
  });
};

const handleViewModalClose = () => {
  setCertiViewModal({
    isOpen: false,
    questUserId: null
  });
};

  const handleActionSuccess = () => {
    if (onQuestUpdate) {
      onQuestUpdate(questData.id);
    }
  };

  

  // 유저들
  const renderUserAvatars = (users, type) => {
    const displayUsers = users.slice(0, 3);
    const remainingCount = users.length - 3;

    return (
      <div 
        className={styles.userAvatars}
        onClick={() => handleUserListClick(type)}
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

  const renderLogoutButtons = () => {
    return (
        <div className={styles.questButtons}>
          <span className={styles.statusText}>
            지구방방에 로그인 시 퀘스트에 도전할 수 있습니다.
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

  // 상태별 버튼 렌더링
  const renderStatusButtons = () => {
    switch(questData.quest_status) {
      case 'IN_PROGRESS':
        return (
          <div className={styles.questButtons}>
            <span className={styles.statusText}>
              {formatDate(questData.started_at)}에 시작되어<br />
              진행 중인 퀘스트입니다
            </span>
            <div className={styles.buttonGroup}>
              <button className={styles.verifyBtn} onClick={handleVerifyClick}>
                인증하기
              </button>
              <button className={styles.giveUpBtn} onClick={handleGiveUpClick}>
                포기하기
              </button>
            </div>
          </div>
        );
      
      case 'COMPLETED':
        return (
          <div className={styles.questButtons}>
            <span className={styles.statusText}>
              {formatDate(questData.started_at)}에 시작되어<br />
              {formatDate(questData.completed_at)}에 완료된 퀘스트입니다
            </span>
            <button className={styles.viewCertBtn} onClick={handleViewCertificationClick}>
              인증 보러가기
            </button>
          </div>
        );
      
      case 'GIVEN_UP':
        return (
          <div className={styles.questButtons}>
            <span className={styles.statusText}>
              {formatDate(questData.started_at)}에 시작되어<br />
              {formatDate(questData.given_up_at)}에 포기한 퀘스트입니다
            </span>
            {questData.status === "INACTIVE" ? (
              <span className={styles.statusText}>
                시즌이 종료된 퀘스트입니다
              </span>
            ) : (
              <button className={styles.retryBtn} onClick={handleRetryClick}>
                다시 도전하기
              </button>
            )}
          </div>
        );

      default:
        return (
          <div className={styles.questButtons}>
            {questData.status === "INACTIVE" ? (
              <span className={styles.statusText}>
                시즌이 종료된 퀘스트입니다
              </span>
            ) : (
              <button className={styles.challengeBtn} onClick={handleChallengeClick}>
                도전하기
              </button>
            )}
          </div>
        );
    }
  };

  // 설명과 조건 분리
  const parseDescription = (text) => {
    const converted = convertUnicodeToEmoji(text);
    const parts = converted.split('✅ 퀘스트 조건:');
    
    if (parts.length === 2) {
      return {
        description: parts[0].trim(),
        conditions: parts[1].trim()
      };
    }
    
    return {
      description: converted,
      conditions: null
    };
  };

  const { description, conditions } = parseDescription(questData.description);

  if (!questData) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.questModal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className={styles.modalContent}>
          <div className={styles.modalLayout}>
            {/* 왼쪽 열 */}
            <div className={styles.leftColumn}>
              {/* 제목 */}
              <h2 className={styles.questTitle}>{questData.title}</h2>
              
              {/* 난이도와 XP */}
              <div className={styles.questMeta}>
                <span className={styles.difficulty}>{getDifficultyText(questData.difficulty)}</span>
                <span className={styles.separator}>|</span>
                <span className={styles.xp}>{questData.xp} XP</span>
              </div>
              
              {/* 시즌 정보 */}
              {questData.is_seasonal && (
                <div className={styles.seasonInfo}>
                  {formatDate(questData.season_start)} ~ {formatDate(questData.season_end)}
                </div>
              )}
              
              {/* 배지 */}
              <div className={styles.badgeSection}>
                {renderBadges()}
              </div>

              {/* 유저 목록 */}
              <div className={styles.userSections}>
                <div className={styles.userSection}>
                  <div className={styles.sectionTitle}>진행 중인 여행자들 ({questData.count_in_progress})</div>
                  {renderUserAvatars(questData.in_progress_user, 'progress')}
                </div>
                
                <div className={styles.userSection}>
                  <div className={styles.sectionTitle}>완료한 여행자들 ({questData.count_completed})</div>
                  {renderUserAvatars(questData.completed_user, 'completed')}
                </div>
              </div>
            </div>
            
            {/* 오른쪽 열 */}
            <div className={styles.rightColumn}>
              {/* 통계 */}
              <div className={styles.statsSection}>
                <span>현재 {questData.count_in_progress}명 도전 중</span>
                <span className={styles.separator}>|</span>
                <span>완수율 {calculateCompletionRate()}%</span>
              </div>
              
              {/* 설명 */}
              <div className={styles.questDescription}>
                <div className={styles.descriptionInner}>
                  {description}
                </div>
              </div>
              
              {/* 조건 (있는 경우만) */}
              {conditions && (
                <div className={styles.questConditions}>
                  <h4>퀘스트 조건</h4>
                  <div className={styles.conditionText}>
                    {conditions}
                  </div>
                </div>
              )}
              
              {/* 상태별 버튼 */}
              {isLogin ? renderStatusButtons() : renderLogoutButtons()}
            </div>
          </div>
        </div>
      </div>

      {showUserList && (
        <ModalUserList
          isOpen={showUserList}
          onClose={() => setShowUserList(false)}
          type="quest"
          inProgressUsers={questData.in_progress_user || []}
          completedUsers={questData.completed_user || []}
        />
      )}

      {/* 액션 확인 모달 */}
      <QuestActionModal
       currentUserId={currentUserId}
        isOpen={actionModal.isOpen}
        onClose={handleActionModalClose}
        actionType={actionModal.type}
        questTitle={questData.title}
        quest_id={questData.id}
        quest_user_id={questData.quest_user_id}
        onSuccess={handleActionSuccess}
      />

      <QuestCertificationModal
        isOpen={isCertiModalOpen}
        onClose={() => setIsCertiModalOpen(false)}
        questData={questData}
        questUserId={questData.quest_user_id}
        onSuccess={handleActionSuccess}
         currentUserId={currentUserId}
      />

      <QuestCertificationViewModal
      isOpen={CertiViewModal.isOpen}
      onClose={handleViewModalClose}
      questUserId={CertiViewModal.questUserId}
      currentUserId={currentUserId}
    />
    </div>
  );
};

export default QuestModal;