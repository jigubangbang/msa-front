import React from 'react';
import styles from './UserInfoPanel.module.css';
import SimpleCard from '../SimpleCard/SimpleCard';
import QuestListCard from '../QuestListCard/QuestListCard';

const UserInfoPanel = ({ 
  user, 
  userQuests = [], 
  calculatePerformance 
}) => {
  return (
    <div className={styles.loginContent}>
      <div className={styles.myInfo}>
        <div className={styles.myProfile}>
          <img 
            src={user?.profile_image || "/icons/common/user_profile.svg"} 
            alt="user_profile_image" 
            className={styles.profileImage}
          />
        </div>
        <div className={styles.myText}>
          <h2 className={styles.myNickname}>{user?.nickname || "사용자"}</h2>
          <h2 className={styles.myLevel}>Lv. {user?.level || 0}</h2>
        </div>
      </div>

      <div className={styles.card}>
        <SimpleCard 
          title="Total Quests Completed" 
          count={user?.completed_quest_count || 0}
        />
      </div>

      <div className={styles.card}>
        <SimpleCard 
          title="XP" 
          count={user?.xp || 0}
        />
      </div>

      <div className={styles.card}>
        <SimpleCard 
          title="Performance" 
          count={calculatePerformance ? calculatePerformance(user?.completed_quest_count, user?.in_progress_quest_count) : "0%"}
        />
      </div>

      <div className={styles.card}>
        <QuestListCard 
          title="Ongoing Quests"
          quest={userQuests}
        />
      </div>
    </div>
  );
};

export default UserInfoPanel;