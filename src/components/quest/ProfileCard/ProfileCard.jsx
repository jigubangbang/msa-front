import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

import styles from './ProfileCard.module.css';
import defaultProfile from "../../../assets/default_profile.png";


const ProfileCard = ({ 
  id, 
  title, 
  count, 
  profile_image, 
  level, 
  nickname 
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleProfileClick = () => {
    if (id===null){
      return;
    }
    window.scrollTo(0, 0);
     navigate(`/my-quest/profile/${id}`);
  };

  return (
    <div className={styles.profileCard}>

      <div className={styles.content}>
        <h2 className={styles.title}>
          {title}
        </h2>
      </div>

      <div className={styles.footer}>
        <p className={styles.count}>
          : {count? count : 0}
        </p>
        <div className={styles.rightSection}>

        <span className={styles.level}>
            Lv. {level ? level :  0}
          </span>

        <div className={styles.profile}>
        
          <div 
            className={styles.imageContainer}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleProfileClick}
          >
            <div className={styles.image}>
              {profile_image ? (
                <img 
                  src={profile_image} 
                  alt={nickname}
                  className={styles.img}
                />
              ) : (
                <img 
                  src={defaultProfile} 
                  alt={nickname}
                  className={styles.img}
                />
              )}
            </div>
            
            {isHovered && (
              <div className={styles.overlay}>
                <span className={styles.nickname}>
                  {nickname}
                </span>
              </div>
            )}
          </div>
          
          
        </div>
      </div>
    </div>
    </div>
  );
};

export default ProfileCard;