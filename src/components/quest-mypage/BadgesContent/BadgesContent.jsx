import React, { useEffect, useState, useCallback } from "react";
import ReactDOM from 'react-dom';

import styles from "./BadgesContent.module.css";

import API_ENDPOINTS from "../../../utils/constants";
import QuestModal from "../../../components/modal/QuestModal/QuestModal";
import BadgeModal from "../../../components/modal/BadgeModal/BadgeModal";
import BadgeItem from "./BadgeItem/BadgeItem";
import api from "../../../apis/api";
import CirclesSpinner from "../../common/Spinner/CirclesSpinner";


export default function BadgesContent({
      userInfo,
      isLogin,
      isMine,
      onUpdate,
      currentUserId
    }) {
  const [loading, setLoading] = useState(false);

  // Modal states 
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [selectedBadge, setSelectedBadge] = useState(null);
    //const { userId } = useParams();


  useEffect(()=>{

  }, []);

  const handleBadgeClick = (badge) => {
    openBadgeModal(badge.badge_id);
  };

  const handleUpdate = () => {
    if(onUpdate){
        onUpdate();
    }
  }

  
  //quest modal
const openQuestModal = useCallback( async (quest_id) => {
  setLoading(true);
  try {
    const endpoint = isLogin 
    ? `${API_ENDPOINTS.QUEST.USER}/detail/${quest_id}`
    : `${API_ENDPOINTS.QUEST.PUBLIC}/detail/${quest_id}`;

    const config = {};

    if (isLogin) {
        config.headers = {
            'User-Id': currentUserId
        };
    }

    const response = await api.get(endpoint, config);
    setSelectedQuest(response.data);
    setShowQuestModal(true);
    console.log("Quest data fetched:", response.data);
  } catch (error) {
    console.error("Failed to fetch quest data:", error);
  } finally {
    setLoading(false);
  }
}, [isLogin]);

const closeQuestModal = () => {
  setShowQuestModal(false);
  setSelectedQuest(null);
};

// 모달
const openBadgeModal = useCallback(async (badge_id) => {
  setLoading(true);

try {
    const endpoint = isLogin 
        ? `${API_ENDPOINTS.QUEST.USER}/badges/${badge_id}`
        : `${API_ENDPOINTS.QUEST.PUBLIC}/badges/${badge_id}`;

    const config = {};
    if (isLogin) {
        config.headers = {
            'User-Id': currentUserId
        };
    }

    const response = await api.get(endpoint, config);
    setSelectedBadge(response.data);
    setShowBadgeModal(true);
    console.log("Badge data fetched:", response.data);
  } catch (error) {
    console.error("Failed to fetch badge data:", error);
  } finally {
    setLoading(false);
  }
},[isLogin]);

const closeBadgeModal = () => {
  setShowBadgeModal(false);
  setSelectedBadge(null);
};

// 퀘스트에서 배지 클릭 핸들러
const handleBadgeClickFromQuest = (badge_id) => {
  closeQuestModal(); // 퀘스트 모달 닫기
  openBadgeModal(badge_id); // 배지 모달 열기
};

// 배지에서 퀘스트 클릭 핸들러
const handleQuestClickFromBadge = (quest_id) => {
  closeBadgeModal(); // 배지 모달 닫기
  openQuestModal(quest_id); // 퀘스트 모달 열기
};



 if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <CirclesSpinner/>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
        <div className={styles.content}>

        <div className={styles.badgesContainer}>
          {/* 5개씩 묶어서 렌더링 */}
          {Array.from({ length: Math.ceil(userInfo.badge.badges.length / 5) }, (_, rowIndex) => (
            <div key={rowIndex} className={styles.badgesRow}>
              {userInfo.badge.badges
                .slice(rowIndex * 5, (rowIndex + 1) * 5)
                .map((badge) => (
                  <BadgeItem
                    key={badge.badge_id}
                    badge={badge}
                    isMine={isMine}
                    onBadgeClick={handleBadgeClick}
                    onUpdate={handleUpdate}
                     isPinnedBadge={badge.badge_id === userInfo.badge?.pinned_badge?.id}
                  />
                ))}
            </div>
          ))}
        </div>
      

      {/* 모달들을 Portal로 body에 렌더링 */}
      {showQuestModal && ReactDOM.createPortal(
        <QuestModal 
          questData={selectedQuest} 
          onClose={closeQuestModal}
          onBadgeClick={handleBadgeClickFromQuest}
          isLogin={isLogin} 
          onQuestUpdate={handleUpdate}
          currentUserId={currentUserId}
        />,
        document.body
      )}

      {showBadgeModal && ReactDOM.createPortal(
        <BadgeModal 
          badgeData={selectedBadge} 
          onClose={closeBadgeModal}
          onQuestClick={handleQuestClickFromBadge}
          isLogin={isLogin} 
        />,
        document.body
      )}
    </div>
    </div>
  );
}