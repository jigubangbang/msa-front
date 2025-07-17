
import api from '../../../apis/api';
import API_ENDPOINTS from '../../../utils/constants';
import styles from './MyPageHeader.module.css';
import React, {useState, useEffect} from "react";


const MyPageHeader = ({ 
  profileImage,
  nickname,
  userId,
  pinnedBadge,
  pinnedBadgeInfo,
  inProgressQuests,
  completedQuests,
  awardedBadges,
  onBadgeClick,
  
}) => {
    const [badgeHover, setBadgeHover] = useState(false);
    const [levelHover, setLevelHover] = useState(false); 
  const [levelInfo, setLevelInfo] = useState({
    currentLevel: 1,
    currentXp: 0,
    nextLevel: 2,
    xpRequiredForNextLevel: 100,
    xpNeededForNextLevel: 100,
    isMaxLevel: false
  });

  useEffect(() => {
    const fetchUserLevel = async () => {
      try {
        const response = await api.get(`${API_ENDPOINTS.QUEST.PUBLIC}/user-level/${userId}`);
        if (response.data) {
          setLevelInfo({
            currentLevel: response.data.currentLevel,
            currentXp: response.data.currentXp,
            nextLevel: response.data.nextLevel,
            xpRequiredForNextLevel: response.data.xpRequiredForNextLevel,
            xpRequiredForCurrentLevel: response.data.xpRequiredForCurrentLevel,
            xpNeededForNextLevel: response.data.xpNeededForNextLevel,
            isMaxLevel: response.data.maxLevel
          });
        }
      } catch (error) {
        console.error('Failed to fetch user level:', error);
      }
    };

    if (userId) {
      fetchUserLevel();
    }
  }, [userId]);

 const getProgressPercentage = () => {
  if (levelInfo.isMaxLevel) return 100;
  
  const { currentXp, xpRequiredForCurrentLevel, xpRequiredForNextLevel } = levelInfo;
  
  const progress = ((currentXp - xpRequiredForCurrentLevel) / (xpRequiredForNextLevel - xpRequiredForCurrentLevel)) * 100;

  
  return Math.max(0, Math.min(100, progress));
};
  

  const handleBadgeClick = () => {
    if (pinnedBadgeInfo && onBadgeClick) {
      onBadgeClick(pinnedBadgeInfo.id);
    }
  };

  const handleBadgeMouseEnter = () => {
    if (pinnedBadgeInfo) {
      setBadgeHover(true);
    }
  };

  const handleBadgeMouseLeave = () => {
    setBadgeHover(false);
  };

  const handleLevelMouseEnter = () => {
    setLevelHover(true);
  };

  const handleLevelMouseLeave = () => {
    setLevelHover(false);
  };

  const handleProfileClick = () => {
    //#NeedToChange
    console.log(userId);
  }

  return (
    <div className={styles.questList}>
      <div className={styles.headerContainer}>
        {/* 프로필 이미지 섹션 */}
        <div className={styles.profileSection}>

          <div className={styles.imageContainer}>
            <div className={styles.image} onClick={handleProfileClick}>
              {profileImage ? (
                <img src={profileImage} alt="프로필" className={styles.img} />
              ) : (
                <div className={styles.defaultAvatar}>
                <img src="/icons/common/default_profile.png" alt="기본 뱃지 이미지"/>
              </div>
              )}
            </div>
          </div>
        </div>

        {/* 배지 섹션 */}
        <div className={styles.badgeSection}>
          <div 
            className={styles.pinnedBadge}
            onMouseEnter={handleBadgeMouseEnter}
            onMouseLeave={handleBadgeMouseLeave}
            onClick={handleBadgeClick}
            style={{ 
              cursor: pinnedBadgeInfo ? 'pointer' : 'default',
            }}
          >
            {pinnedBadge ? (
              <>
                <img src={pinnedBadge} alt="고정 배지" className={styles.badgeImage} />
                {badgeHover && pinnedBadgeInfo && (
                  <div className={styles.badgeTooltip} >
                    <div className={styles.badgeKorTitle}>{pinnedBadgeInfo.kor_title}</div>
                    <div className={styles.badgeEngTitle}>{pinnedBadgeInfo.eng_title}</div>
                    <div className={styles.badgeClickHint}>클릭하여 뱃지 보기</div>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.defaultBadge}>
                <img src="/icons/common/unknwon_badge.png" alt="기본 뱃지 이미지"/>
              </div>
            )}
          </div>
        </div>

        {/* 사용자 정보 섹션 */}
        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <span className={styles.nickname}>{nickname}</span>
            <span className={styles.userId}>({userId})</span>
            
          </div>

            {/*  레벨 프로그레스 바 */}
            <div 
              className={styles.levelSection}
              onMouseEnter={handleLevelMouseEnter}
              onMouseLeave={handleLevelMouseLeave}
            >
              <div className={styles.levelInfo}>
                <span className={styles.levelText}>Lv. {levelInfo.currentLevel}</span>
                <div className={styles.progressBarContainer}>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ width: `${getProgressPercentage()}%` }}
                    />
                  </div>
                </div>
            </div>

            {/* 레벨 호버 툴팁 */}
            {levelHover && (
              <div className={styles.levelTooltip}>
                <div className={styles.levelTooltipHeader}>
                  <span className={styles.currentLevelText}>Level {levelInfo.currentLevel}</span>
                  {!levelInfo.isMaxLevel && <span className={styles.nextLevelText}>→ Level {levelInfo.nextLevel}</span>}
                </div>
                <div className={styles.xpInfo}>
                  <div className={styles.xpCurrent}>현재 XP: <strong>{levelInfo.currentXp.toLocaleString()}</strong></div>
                  {!levelInfo.isMaxLevel && (
                    <>
                      <div className={styles.xpNeeded}>다음 레벨까지: <strong>{levelInfo.xpNeededForNextLevel.toLocaleString()} XP</strong></div>
                      <div className={styles.xpTotal}>다음 레벨 필요 XP: {levelInfo.xpRequiredForNextLevel.toLocaleString()}</div>
                    </>
                  )}
                  {levelInfo.isMaxLevel && (
                    <div className={styles.maxLevel}>🎉 최고 레벨 달성!</div>
                  )}
                </div>
                <div className={styles.progressInfo}>
                  다음 레벨까지 <strong>{getProgressPercentage().toFixed(1)}%</strong>
                </div>
              </div>
            )}
          </div>

                {/* 통계 섹션 */}
            <div className={styles.statsSection}>
            <div className={styles.statItem}>
                <div className={styles.statLabel}>진행 중인 퀘스트</div>
                <div className={styles.statValue}>{inProgressQuests}개</div>
            </div>
            
            <div className={styles.statItem}>
                <div className={styles.statLabel}>완료한 퀘스트</div>
                <div className={styles.statValue}>{completedQuests}개</div>
            </div>
            
            <div className={styles.statItem}>
                <div className={styles.statLabel}>얻은 뱃지 개수</div>
                <div className={styles.statValue}>{awardedBadges}개</div>
            </div>
            </div>
          
        </div>


      </div>
    </div>
  );
};

export default MyPageHeader;