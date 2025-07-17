import React from 'react';
import styles from './UserInfoPanel.module.css';
import SimpleCard from '../SimpleCard/SimpleCard';
import QuestListCard from '../QuestListCard/QuestListCard';

const UserInfoPanel = ({ 
  user, 
  userQuests = [], 
  calculatePerformance,
  isLogin = false,
  handleQuestClick
}) => {
  
  return (
    <div className={styles.loginContent}>
      <div className={styles.myInfo}>
        <div className={styles.myProfile}>
          <img 
            src={user?.profile_image || "/icons/common/default_profile.png"} 
            alt="user_profile_image" 
            className={styles.profileImage}
          />
        </div>
        <div className={styles.myText}>
          <h2 className={styles.myNickname}>{user?.nickname || "Guest"}</h2>
          <h2 className={styles.myLevel}>Lv. {user?.level || 0}</h2>
        </div>
      </div>

      <div className={styles.card}>
        <SimpleCard 
          title="Total Quests Completed" 
          count={isLogin ? (user?.completed_quest_count || 0): "?"}
        />
      </div>

      <div className={styles.card}>
        <SimpleCard 
          title="XP" 
          count={isLogin ? user?.xp || 0 : "?"}
        />
      </div>

      <div className={styles.card}>
        <SimpleCard 
          title="Performance" 
          count={
          isLogin 
            ? calculatePerformance(user?.completed_quest_count, user?.in_progress_quest_count) 
            : "??%"
        }
        />
      </div>

      <div className={styles.card}>
        <SimpleCard 
          title="Badges" 
          count={isLogin? user?.badge_totalCount || 0 :  "?"}
        />
      </div>

      <div className={styles.card}>
        <QuestListCard 
          title="Ongoing Quests"
          quest={userQuests}
          isLogin={isLogin}
          handleQuestClick={handleQuestClick}
        />
      </div>
    </div>
  );
};

export default UserInfoPanel;