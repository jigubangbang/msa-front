import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

import styles from "./QuestListPage.module.css";
import Sidebar from "../../../components/common/SideBar/SideBar";

import UserInfoPanel from "../../../components/rank/UserInfoPanel/UserInfoPanel";
import API_ENDPOINTS from "../../../utils/constants";
import { QUEST_SIDEBAR } from "../../../utils/sidebar";
import RankQuestList from "../../../components/rank/RankQuestList/RankQuestList";
import QuestModal from "../../../components/modal/QuestModal/QuestModal";
import BadgeModal from "../../../components/modal/BadgeModal/BadgeModal";



export default function QuestListPage() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [userQuests, setUserQuests] = useState([]);
  const [isLogin, setIsLogin] = useState(false);

// Modal states 
const [showQuestModal, setShowQuestModal] = useState(false);
const [showBadgeModal, setShowBadgeModal] = useState(false);
const [selectedQuest, setSelectedQuest] = useState(null);
const [selectedBadge, setSelectedBadge] = useState(null);

  //SideBar//
    const location = useLocation();
    const currentPath = location.pathname;
      const getActiveMenuItems = () => {
      return QUEST_SIDEBAR.map(item => {
        let isActive = false;
        
        if (item.submenu) {
          isActive = item.path === currentPath;
        } else {
          isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
        }
        return {
          ...item,
          active: isActive
        };
      });
    };
  
    const finalMenuItems = getActiveMenuItems(QUEST_SIDEBAR);
    //SideBar//


  useEffect(()=>{
    const token = localStorage.getItem("accessToken");
    //#NeedToChange 토큰에서 잘 뽑아왔다고 가정
    setIsLogin(true);
    fetchUser();
    fetchUserQuests();
    fectchUserBadges();

    if (token) {
      setIsLogin(true);
      fetchUser();
      fetchUserQuests();
      fectchUserBadges();
    }
  }, []);


  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_ENDPOINTS.QUEST.USER}/journey`);
      setUser(response.data);
      console.log("User data fetched:", response.data);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

    const fectchUserBadges = async() => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_ENDPOINTS.QUEST.USER}/badges/my`);
      setUser(prev => ({
        ...prev,
        badge_totalCount: response.data.totalCount
      }));
      console.log("User Badge data fetched:", response.data);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setLoading(false);
    }
  }

  const fetchUserQuests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_ENDPOINTS.QUEST.USER}/detail`, {
        params: {
          status: "IN_PROGRESS"
        }
      });
      setUserQuests(response.data || []);
      console.log("User quests fetched:", response.data);
    } catch (error) {
      console.error("Failed to fetch user quests:", error);
      setUserQuests([]);
    } finally {
      setLoading(false);
    }
  };

  const calculatePerformance = (completed, inProgress) => {
    const completedCount = completed || 0;
    const inProgressCount = inProgress || 0;
    const total = completedCount + inProgressCount;
    
    if (total === 0) return "0%";
    return Math.round((completedCount / total) * 100) + "%";
  };
  
  //quest modal
const openQuestModal = async (quest_id) => {
  setLoading(true);
  try {
    const endpoint = isLogin 
    ? `${API_ENDPOINTS.QUEST.USER}/detail/${quest_id}`
    : `${API_ENDPOINTS.QUEST.PUBLIC}/detail/${quest_id}`;

    const response = await axios.get(endpoint);
    setSelectedQuest(response.data);
    setShowQuestModal(true);
    console.log("Quest data fetched:", response.data);
  } catch (error) {
    console.error("Failed to fetch quest data:", error);
  } finally {
    setLoading(false);
  }
};

const closeQuestModal = () => {
  setShowQuestModal(false);
  setSelectedQuest(null);
};

// 모달
const openBadgeModal = async (badge_id) => {
  setLoading(true);
  try {
    const endpoint = isLogin 
    ? `${API_ENDPOINTS.QUEST.USER}/badges/${badge_id}`
    : `${API_ENDPOINTS.QUEST.PUBLIC}/badges/${badge_id}`;

    const response = await axios.get(endpoint);
    setSelectedBadge(response.data);
    setShowBadgeModal(true);
    console.log("Badge data fetched:", response.data);
  } catch (error) {
    console.error("Failed to fetch badge data:", error);
  } finally {
    setLoading(false);
  }
};

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
      <div className={styles.Container}>
        <Sidebar menuItems={finalMenuItems} />
        <div className={styles.content}>
          <div className={styles.loading}>로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.Container}>
      <Sidebar menuItems={finalMenuItems} />

      <div className={styles.content}>
        <div className={styles.contentWrapper}>
          <RankQuestList myUserId={user?.user_id || ""} onOpenModal={openQuestModal}/>

          <UserInfoPanel 
            user={user}
            userQuests={userQuests}
            calculatePerformance={calculatePerformance}
            isLogin={isLogin}
          />

        </div>
      </div>

      {/* 퀘스트 모달 */}
      {showQuestModal && (
        <QuestModal 
          questData={selectedQuest} 
          onClose={closeQuestModal}
          onBadgeClick={handleBadgeClickFromQuest}
          isLogin={isLogin} 
        />
      )}

      {/* 배지 모달 */}
      {showBadgeModal && (
        <BadgeModal 
          badgeData={selectedBadge} 
          onClose={closeBadgeModal}
          onQuestClick={handleQuestClickFromBadge}
          isLogin={isLogin} 
        />
      )}
    </div>
  );
}