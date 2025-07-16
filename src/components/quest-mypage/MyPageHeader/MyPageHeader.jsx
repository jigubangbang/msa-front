
import styles from './MyPageHeader.module.css';
import React, {useState} from "react";


const MyPageHeader = ({ 
  profileImage,
  nickname,
  userId,
  pinnedBadge,
  pinnedBadgeInfo,
  inProgressQuests,
  completedQuests,
  awardedBadges,
  onBadgeClick
}) => {
    const [badgeHover, setBadgeHover] = useState(false);

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