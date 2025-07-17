import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom';


import styles from "./BadgeListPage.module.css";
import Sidebar from "../../../components/common/SideBar/SideBar";

import UserInfoPanel from "../../../components/rank/UserInfoPanel/UserInfoPanel";
import API_ENDPOINTS from "../../../utils/constants";
import { QUEST_SIDEBAR } from "../../../utils/sidebar";
import RankBadgeList from "../../../components/rank/RankBadgeList/RankBadgeList";
import QuestModal from "../../../components/modal/QuestModal/QuestModal";
import BadgeModal from "../../../components/modal/BadgeModal/BadgeModal";
import api from "../../../apis/api";
import { jwtDecode } from 'jwt-decode';




export default function BadgeListPage() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [userQuests, setUserQuests] = useState([]);
  const [isLogin, setIsLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [badgeSearchTerm, setBadgeSearchTerm] = useState('');
  const [badgeCurrentPage, setBadgeCurrentPage] = useState(1);
const [currentUserId, setCurrentUserId] = useState(null);


// Modal states 
const [showQuestModal, setShowQuestModal] = useState(false);
const [showBadgeModal, setShowBadgeModal] = useState(false);
const [selectedQuest, setSelectedQuest] = useState(null);
const [selectedBadge, setSelectedBadge] = useState(null);
  

  //SideBar//
    const location = useLocation();
    const currentPath = location.pathname;
      const getActiveMenuItems = () => {
          return QUEST_SIDEBAR(isAdmin).map(item => {
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
  
    const finalMenuItems = getActiveMenuItems();
    //SideBar//


  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    
    if (token) {
        try {
            const decoded = jwtDecode(token);
            
            const currentTime = Math.floor(Date.now() / 1000);
            if (decoded.exp && decoded.exp < currentTime) {
                localStorage.removeItem("accessToken");
                setIsLogin(false);
                setIsAdmin(false);
                setCurrentUserId(null);
                return;
            }
            
            setIsLogin(true);
            setCurrentUserId(decoded.sub || decoded.userId);
            
            const userRole = decoded.role || decoded.authorities;
            const isAdminUser = userRole === 'ROLE_ADMIN' || 
                               (Array.isArray(userRole) && userRole.includes('ROLE_ADMIN'));
            setIsAdmin(isAdminUser);
            
            fetchUser();
            fetchUserQuests();
            fectchUserBadges();
            
        } catch (error) {
            console.error("토큰 디코딩 오류:", error);
            localStorage.removeItem("accessToken");
            setIsLogin(false);
            setIsAdmin(false);
            setCurrentUserId(null);
        }
    } else {
        setIsLogin(false);
        setIsAdmin(false);
        setCurrentUserId(null);
    }
}, [currentUserId]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await api.get(`${API_ENDPOINTS.QUEST.USER}/journey`, {
    headers: {
        'User-Id': currentUserId
    }
});
      setUser(response.data);
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
      const response = await api.get(`${API_ENDPOINTS.QUEST.USER}/badges/my`, {
    headers: {
        'User-Id': currentUserId
    }
});
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
      const response = await api.get(`${API_ENDPOINTS.QUEST.USER}/detail`, {
      params: {
          status: "IN_PROGRESS"
      },
      headers: {
          'User-Id': currentUserId
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
const openQuestModal = useCallback(async (quest_id) => {
  setLoading(true);
  try {
    const endpoint = isLogin 
    ? `${API_ENDPOINTS.QUEST.USER}/detail/${quest_id}`
    : `${API_ENDPOINTS.QUEST.PUBLIC}/detail/${quest_id}`;

const config = {};

// 로그인 상태일 때만 User-Id 헤더 추가
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
},[isLogin]);

const closeQuestModal = () => {
  setShowQuestModal(false);
  setSelectedQuest(null);
};

const handleQuestUpdate = async (questId) => {
  console.log('퀘스트 데이터 새로고침 중...', questId);
  setLoading(true);
  try {
    // 1. 현재 퀘스트 모달 새로고침
    const endpoint = isLogin 
    ? `${API_ENDPOINTS.QUEST.USER}/detail/${questId}`
    : `${API_ENDPOINTS.QUEST.PUBLIC}/detail/${questId}`;

const config = {};

// 로그인 상태일 때만 User-Id 헤더 추가
if (isLogin) {
    config.headers = {
        'User-Id': currentUserId
    };
}

const response = await api.get(endpoint, config);
    setSelectedQuest(response.data); 
    
    // 2. 사용자 퀘스트 목록 새로고침
    const userQuestsResponse = await api.get(`${API_ENDPOINTS.QUEST.USER}/detail`, {
    params: { status: "IN_PROGRESS" },
    headers: {
        'User-Id': currentUserId
    }
});
       setUserQuests(userQuestsResponse.data || []);

       

    // 3. 사용자 정보 새로고침
    const userResponse = await api.get(`${API_ENDPOINTS.QUEST.USER}/journey`, {
  headers: {
    'User-Id': currentUserId,
  },
});
    setUser(userResponse.data);
    
  } catch (error) {
    console.error("Failed to refresh quest data:", error);
  } finally {
    setLoading(false);
  }
};

// 모달
const openBadgeModal = useCallback(async (badge_id) => {
  setLoading(true);
  try {
    const endpoint = isLogin 
  ? `${API_ENDPOINTS.QUEST.USER}/badges/${badge_id}`
  : `${API_ENDPOINTS.QUEST.PUBLIC}/badges/${badge_id}`;

const config = isLogin
  ? { headers: { 'User-Id': currentUserId } }
  : {};

const response = await api.get(endpoint, config);

    setSelectedBadge(response.data);
    setShowBadgeModal(true);
    console.log("Badge data fetched:", response.data);
    console.log(isLogin);
  } catch (error) {
    console.error("Failed to fetch badge data:", error);
  } finally {
    setLoading(false);
  }
}, [isLogin]);

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
        <Sidebar menuItems={finalMenuItems} isAdmin={isAdmin} isLogin={isLogin}/>
        <div className={styles.content}>
          <div className={styles.loading}>로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.Container}>
      <Sidebar menuItems={finalMenuItems} isLogin={isLogin}/>

      <div className={styles.content}>
        <div className={styles.contentWrapper}>
          <RankBadgeList 
            key="badge-list"
            onOpenBadgeModal={openBadgeModal}

            searchTerm={badgeSearchTerm}
            setSearchTerm={setBadgeSearchTerm}
            currentPage={badgeCurrentPage}
            setCurrentPage={setBadgeCurrentPage}
          />

          <UserInfoPanel 
            currentUserId={currentUserId}
            user={user}
            userQuests={userQuests}
            calculatePerformance={calculatePerformance}
            isLogin={isLogin}
            handleQuestClick={openQuestModal}
          />

        </div>
      </div>

      {/* 모달들을 Portal로 body에 렌더링 */}
      {showQuestModal && ReactDOM.createPortal(
        
        <QuestModal 
        currentUserId={currentUserId}
          questData={selectedQuest} 
          onClose={closeQuestModal}
          onBadgeClick={handleBadgeClickFromQuest}
          isLogin={isLogin}
          onQuestUpdate={handleQuestUpdate} 
        />,
        document.body
      )}

      {showBadgeModal && ReactDOM.createPortal(
        <BadgeModal 
        currentUserId={currentUserId}
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