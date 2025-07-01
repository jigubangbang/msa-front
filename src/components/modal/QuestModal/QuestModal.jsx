import React, { useState } from 'react';
import styles from './QuestModal.module.css';

const QuestModal = ({ questData, onClose, isLogin=false }) => {
  const [badgeHover, setBadgeHover] = useState(false);

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
  const handleBadgeClick = () => {
    console.log('배지 클릭:', questData.badge_id);
  };

  // 유저 목록 클릭 
  const handleUserListClick = (type) => {
    if (type === 'progress') {
      console.log('진행 중인 유저들:', questData.in_progress_user);
    } else {
      console.log('완료한 유저들:', questData.completed_user);
    }
  };

  // 버튼들
  const handleChallengeClick = () => {
    console.log('도전하기');
  };

  const handleVerifyClick = () => {
    console.log('인증하기', questData.quest_user_id);
  };

  const handleGiveUpClick = () => {
    console.log('포기하기', questData.quest_user_id);
  };

  const handleViewCertificationClick = () => {
    console.log('인증 보러가기', questData.quest_user_id);
  };

  const handleRetryClick = () => {
    console.log('다시 도전하기');
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
                <img src="/icons/common/user_profile.svg" alt={user.nickname} />
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

  // 상태별 버튼 렌더링
  const renderStatusButtons = () => {
    switch(questData.quest_status) {
      case 'IN_PROGRESS':
        return (
          <div className={styles.questButtons}>
            <span className={styles.statusText}>
              {formatDate(questData.started_at)}에 시작된 퀘스트입니다
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
              {formatDate(questData.started_at)}에 시작되어 <br/> {formatDate(questData.completed_at)}에 완료된 퀘스트입니다
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
              {formatDate(questData.started_at)}에 시작되어 {formatDate(questData.given_up_at)}에 포기한 퀘스트입니다
            </span>
            <button className={styles.retryBtn} onClick={handleRetryClick}>
              다시 도전하기
            </button>
          </div>
        );
      
      default:
        return (
          <div className={styles.questButtons}>
            <button className={styles.challengeBtn} onClick={handleChallengeClick}>
              도전하기
            </button>
          </div>
        );
    }
  };

  // 설명 텍스트 포맷팅
  const formatDescription = (text) => {
    const converted = convertUnicodeToEmoji(text);
    return converted.replace(/✅/g, '\n✅');
  };

  if (!questData) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.questModal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <button className={styles.closeBtn} onClick={onClose}>
            <img src="/icons/common/close.svg" alt="x"></img>
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
                <div 
                  className={styles.badgeContainer}
                  onMouseEnter={() => setBadgeHover(true)}
                  onMouseLeave={() => setBadgeHover(false)}
                  onClick={handleBadgeClick}
                >
                  <img 
                    src={questData.badge_icon} 
                    alt="badge" 
                    className={styles.badgeIcon}
                    style={{ opacity: badgeHover ? 0.7 : 1 }}
                  />
                  {badgeHover && (
                    <div className={styles.badgeTooltip}>
                      <div className={styles.badgeKorTitle}>{questData.kor_title}</div>
                      <div className={styles.badgeEngTitle}>{questData.eng_title}</div>
                    </div>
                  )}
                </div>
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
                {formatDescription(questData.description).split('\n').map((line, index) => (
                  <div key={index} className={line.startsWith('✅') ? styles.conditionLine : ''}>
                    {line}
                  </div>
                ))}
              </div>
              
              {/* 상태별 버튼 */}
              {renderStatusButtons()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestModal;