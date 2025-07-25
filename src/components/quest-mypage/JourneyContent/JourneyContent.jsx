import React, { useEffect, useState, useCallback } from "react";
import ReactDOM from 'react-dom';

import styles from "./JourneyContent.module.css";
import API_ENDPOINTS from "../../../utils/constants";
import BadgeModal from "../../modal/BadgeModal/BadgeModal";
import QuestModal from "../../modal/QuestModal/QuestModal";
import ProgressBar from "../ProgressBar/ProgressBar";
import CircleProgress from "../ProgressBar/CircleProgress";
import UserTimeline from "../UserTimeline/UserTimeline";
import CompactLevelChart from "../CompactLevelChart/CompactLevelChart";
import api from "../../../apis/api";
import CirclesSpinner from "../../common/Spinner/CirclesSpinner";

export default function JourneyContent({
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

  useEffect(()=>{

  }, []);

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
  }, [isLogin, currentUserId]);

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
  }, [isLogin, currentUserId]);

  const closeBadgeModal = () => {
    setShowBadgeModal(false);
    setSelectedBadge(null);
  };

  const handleBadgeClick = (badge_id) => {
      openBadgeModal(badge_id);
    };

    const handleQuestClick = (quest_id)=>{
      openQuestModal(quest_id);
    }

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

  // userInfo가 없으면 로딩 표시
  if (!userInfo || loading) {
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
              <div className={styles.Container}>
                  <div className={styles.top}>
                    <CompactLevelChart userId={userInfo?.user?.user_id}/>
                    <ProgressBar data={userInfo} />
                  </div>
                  <CircleProgress questData={userInfo?.quest} />
                  <UserTimeline data={userInfo} onBadgeClick={handleBadgeClick} onQuestClick={handleQuestClick}/>
              </div>
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
    );
}