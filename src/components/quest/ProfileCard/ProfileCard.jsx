import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

import styles from './ProfileCard.module.css';
import defaultProfile from "../../../assets/default_profile.png";
import crownIcon from "../../../assets/common/crown.svg";

const ProfileCard = ({ 
  id, 
  title, 
  count, 
  profile_image, 
  level, 
  nickname,
  isTopUser=false
}) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (id===null){
      return;
    }
    window.scrollTo(0, 0);
     navigate(`/my-quest/profile/${id}`);
  };

  return (
    <div className={styles.profileCard} onClick={handleProfileClick}>
      <h2 className={styles.title}>{title}</h2>
      {isTopUser && <img src={crownIcon} alt="왕" className={styles.crownIcon}/>}
      <div className={styles.profileInfo}>
        <div className={styles.profileImageWrapper}>
          <img
            src={profile_image || defaultProfile}
            alt={nickname}
            className={styles.profileImage}
          />
          <span className={styles.levelBadge}>Lv. {level || 0}</span>
        </div>

        <div className={styles.profileText}>
          <p className={styles.nickname}>{nickname}</p>
          <p className={styles.questCount}>레벨 업 : {count || 0} ↑</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;