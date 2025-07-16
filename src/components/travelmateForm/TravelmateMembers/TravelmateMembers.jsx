import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

import api from '../../../apis/api';
import API_ENDPOINTS from '../../../utils/constants';
import styles from './TravelmateMembers.module.css';

const TravelmateMembers = ({ postId }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (postId) {
      fetchMembers();
      console.log(postId);
    }
  }, [postId]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await api.get(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/travelmate/${postId}/members`);
      setMembers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileClick = (userId) => {
    navigate(`/profile/${userId}`);
  }

  if (loading) {
    return (
      <div className={styles.travelmateMembers}>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.travelmateMembers}>
      <div className={styles.header}>
        <h3 className={styles.title}>참여하는 멤버들 ({members.length}명)</h3>
      </div>
      
      <div className={styles.membersList}>
        {members.length === 0 ? (
          <div className={styles.emptyState}>
            <p>아직 참여한 멤버가 없습니다.</p>
          </div>
        ) : (
          members.map((member) => (
            <div key={member.userId} className={styles.memberCard}>
              <div className={styles.profileSection} onClick={() => {handleProfileClick(member.userId)}}>
                <div className={styles.profileImage}>
                  <img 
                    src={member.profileImage || '/icons/common/default_profile.png'} 
                    alt="프로필"
                  />
                </div>
                <div className={styles.memberInfo}>
                  <div className={styles.memberName}>
                    <span className={styles.style}>[{member.travelStyle}]</span>
                    <span className={styles.nickname}>{member.nickname}</span>
                    <span className={styles.userId}>({member.userId})</span>
                  </div>
                  <p className={styles.bio}>{member.bio}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TravelmateMembers;