import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useParams} from 'react-router-dom';
import ReactDOM from 'react-dom';
import { jwtDecode } from 'jwt-decode';

import styles from "./MyQuestPage.module.css";
import Sidebar from "../../../components/common/SideBar/SideBar";

import API_ENDPOINTS from "../../../utils/constants";
import { QUEST_SIDEBAR } from "../../../utils/sidebar";
import QuestModal from "../../../components/modal/QuestModal/QuestModal";
import BadgeModal from "../../../components/modal/BadgeModal/BadgeModal";
import MyPageHeader from "../../../components/quest-mypage/MyPageHeader/MyPageHeader";
import MyPageMenu from "../../../components/quest-mypage/MyPageMenu/MyPageMenu";
import BadgesContent from "../../../components/quest-mypage/BadgesContent/BadgesContent";
import QuestsContent from "../../../components/quest-mypage/QuestsContent/QuestsContent";
import JourneyContent from "../../../components/quest-mypage/JourneyContent/JourneyContent";
import api from "../../../apis/api";

export default function MyQuestPage({page, isMine}) {
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isLogin, setIsLogin] = useState(null); 

  // Modal states 
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const { userId } = useParams();
  const [currentUserId, setCurrentUserId] = useState(null);

  const [isAdmin, setIsAdmin] = useState(false);

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
            console.log("디코딩된 토큰:", decoded); // 디버깅용
            
            const currentTime = Math.floor(Date.now() / 1000);
            if (decoded.exp && decoded.exp < currentTime) {
                localStorage.removeItem("accessToken");
                setIsLogin(false);
                setIsAdmin(false);
                setCurrentUserId(null);
                return;
            }
            
            setIsLogin(true);
            
            // 다양한 필드명 시도
            const extractedUserId = decoded.sub || decoded.userId || decoded.user_id || decoded.id || decoded.username;
            console.log("추출된 userId:", extractedUserId); // 디버깅용
            setCurrentUserId(extractedUserId);
            
            const userRole = decoded.role || decoded.authorities;
            const isAdminUser = userRole === 'ROLE_ADMIN' || 
                               (Array.isArray(userRole) && userRole.includes('ROLE_ADMIN'));
            setIsAdmin(isAdminUser);
            
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
  }, []);

  const fetchUserInfo = useCallback(async () => {
    if (!isMine && !userId) {
      console.error("다른 사용자 페이지인데 userId가 없습니다.");
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log("fetchUserInfo 호출됨 - currentUserId:", currentUserId, "isMine:", isMine, "userId:", userId);
    
    let config = {};
    if (!isMine && userId) {
      // 다른 사용자 페이지
      config = {
        params: { user_id: userId }
      };
      if (currentUserId) {
        config.headers = { 'User-Id': currentUserId };
      }
    } else {
      // 내 페이지
      if (currentUserId) {
        config = {
          headers: { 'User-Id': currentUserId }
        };
      } else {
        config = {};
      }
    }
    
    console.log("API 요청 config:", config);

    try {
      const response = await api.get(`${API_ENDPOINTS.QUEST.PUBLIC}/my-page`, config);
      setUserInfo(response.data);
      console.log("UserInfo data fetched:", response.data);
    } catch (error) {
      console.error("Failed to fetch userInfo data:", error);
      setUserInfo(null);
    } finally {
      setLoading(false);
    }
  }, [isMine, userId, currentUserId]);

  // 로그인 상태가 결정된 후에 사용자 정보 가져오기
  useEffect(() => {
    if (isLogin !== null) { // 로그인 상태가 결정된 후에 실행
      console.log("사용자 정보 가져오기 시작 - isLogin:", isLogin, "currentUserId:", currentUserId);
      fetchUserInfo();
    }
  }, [isLogin, fetchUserInfo]);

  //랜더링 결정
  const renderContent = () => {
    const commonProps = {
      userInfo,
      isLogin,
      userId,
      isMine,
      onUpdate: handleUpdate,
      currentUserId
    };

    switch (page) {
      case 'badge':
        return <BadgesContent {...commonProps} />;
      case 'record':
        return <QuestsContent {...commonProps} />;
      case 'main':
      default:
        return <JourneyContent {...commonProps} />;
    }
  };

  //quest modal
  const openQuestModal = useCallback( async (quest_id) => {
    setLoading(true);
    try {
      const endpoint = isLogin 
      ? `${API_ENDPOINTS.QUEST.USER}/detail/${quest_id}`
      : `${API_ENDPOINTS.QUEST.PUBLIC}/detail/${quest_id}`;

      const config = {};

      // 로그인 상태일 때만 User-Id 헤더 추가
      if (isLogin && currentUserId) {
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

  const handleUpdate = useCallback(async () => {
      console.log('데이터 새로고침 중...');
      await fetchUserInfo();
    }, [fetchUserInfo]);

  // 모달
  const openBadgeModal = useCallback(async (badge_id) => {
    setLoading(true);
    try {
      const endpoint = isLogin 
      ? `${API_ENDPOINTS.QUEST.USER}/badges/${badge_id}`
      : `${API_ENDPOINTS.QUEST.PUBLIC}/badges/${badge_id}`;

      const config = {};

      // 로그인 상태일 때만 User-Id 헤더 추가
      if (isLogin && currentUserId) {
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
            {userInfo && (
              <>
              <MyPageHeader 
                profileImage={userInfo.user?.profile_image}
                nickname={userInfo.user?.nickname}
                userId={userInfo.user?.user_id}
                pinnedBadge={userInfo.badge?.pinned_badge?.icon}
                pinnedBadgeInfo={{
                  id: userInfo.badge?.pinned_badge?.id,
                  kor_title: userInfo.badge?.pinned_badge?.kor_title,
                  eng_title: userInfo.badge?.pinned_badge?.eng_title
                }}
                inProgressQuests={userInfo.quest?.count_in_progress || 0}
                completedQuests={userInfo.quest?.count_completed || 0}
                awardedBadges={userInfo.badge?.count_awarded_badge || 0}
                onBadgeClick={openBadgeModal}
              />

                <MyPageMenu isMine={isMine}/>
                  {renderContent()}
              </>
          )}

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