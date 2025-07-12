import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useParams} from 'react-router-dom';
import ReactDOM from 'react-dom';

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


  useEffect(()=>{
    //const token = localStorage.getItem("accessToken");
    //#NeedToChange 토큰에서 잘 뽑아왔다고 가정
    setIsLogin(isMine);
    fetchUserInfo();
    setIsAdmin(true);

    // if (token) {
    //   setIsLogin(true);
    //   fetchUserInfo();
    // }
  }, [isMine, userId, isAdmin]);

  const fetchUserInfo = useCallback(async () => {
    if (!isMine && !userId) {
      console.error("다른 사용자 페이지인데 userId가 없습니다.");
      return;
    }

    setLoading(true);
    let config = {};
    if (!isMine && userId) {
        config = { params: { user_id: userId } };
      }
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
  },[isMine, userId]);

  //랜더링 결정
  const renderContent = () => {
    const commonProps = {
      userInfo,
      isLogin,
      userId,
      isMine,
      onUpdate: handleUpdate
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

    const response = await api.get(endpoint);
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

    const response = await api.get(endpoint);
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
      <div className={styles.Container}>
        <Sidebar menuItems={finalMenuItems} isAdmin={isAdmin}/>
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