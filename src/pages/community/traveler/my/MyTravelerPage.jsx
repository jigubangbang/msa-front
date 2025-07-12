import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import { TRAVELER_SIDEBAR } from "../../../../utils/sidebar";
import styles from "./MyTravelerPage.module.css";
import Sidebar from "../../../../components/common/SideBar/SideBar";
import { jwtDecode } from 'jwt-decode';
import MyTravelmate from "../../../../components/myTraveler/MyTravelmate/MyTravelmate";
import MyTravelinfo from "../../../../components/myTraveler/MyTravelinfo/MyTravelinfo";
import api from "../../../../apis/api";
import API_ENDPOINTS from "../../../../utils/constants";


export default function MyTravelerPage({page}) {
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [activeTab, setActiveTab] = useState('travelmate'); // 'travelmate' 또는 'travelinfo'
  const [currentUserId, setCurrentUserId] = useState(null);
  const [travelerData, setTravelerData] = useState(null);

  //SideBar//
  const location = useLocation();
  const currentPath = location.pathname;
  const getActiveMenuItems = () => {
    return TRAVELER_SIDEBAR.map(item => {
      let isActive = false;

      if (item.submenu) {
        isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
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
                setCurrentUserId(null);
                return;
            }
            
            setIsLogin(true);
            setCurrentUserId(decoded.sub || decoded.userId);
            
        } catch (error) {
            console.error("토큰 디코딩 오류:", error);
            localStorage.removeItem("accessToken");
            setIsLogin(false);
            setCurrentUserId(null);
        }
    } else {
        setIsLogin(false);
        setCurrentUserId(null);
    }
}, []);

useEffect(() => {
    if (isLogin && currentUserId) {
      fetchTravelerData();
    }
  }, [isLogin, currentUserId]);

  useEffect(() => {
    if (page) {
      switch (page) {
        case "travelmate":
          setActiveTab('travelmate');
          break;
        case "travelinfo":
          setActiveTab('travelinfo'); 
          break;
        default:
          setActiveTab('travelmate');
          break;
      }
    }
  }, [page]); 
const fetchTravelerData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`${API_ENDPOINTS.COMMUNITY.USER}/my-traveler`, {
        headers: {
            'User-Id': currentUserId
        }
    });
      setTravelerData(response.data);
    } catch (error) {
      console.error('여행자 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleUpdate = () => {
  fetchTravelerData();
};


  const handleTabChange = (tabType) => {
    setActiveTab(tabType);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Sidebar menuItems={finalMenuItems} />
        <div className={styles.content}>
          <div className={styles.loading}>로딩 중...</div>
        </div>
      </div>
    );
  }

  
  if (!isLogin) {
    return (
      <div className={styles.container}>
        <Sidebar menuItems={finalMenuItems} />
        <div className={styles.content}>
          <div className={styles.loginRequired}>로그인이 필요합니다.</div>
        </div>
      </div>
    );
  }

   return (
    <div className={styles.container}>
      <Sidebar menuItems={finalMenuItems} />

      <div className={styles.content}>
        <div className={styles.contentWrapper}>
          
          {/* 탭 버튼 */}
          <div className={styles.tabSection}>
            <div className={styles.tabButtons}>
              <button
                className={`${styles.tabButton} ${activeTab === 'travelmate' ? styles.active : ''}`}
                onClick={() => handleTabChange('travelmate')}
              >
                내 여행자 모임
              </button>
              <button
                className={`${styles.tabButton} ${activeTab === 'travelinfo' ? styles.active : ''}`}
                onClick={() => handleTabChange('travelinfo')}
              >
                내 여행자 정보 공유방
              </button>
            </div>
          </div>

          {/* 컨텐츠 영역 */}
          <div className={styles.contentArea}>
            {activeTab === 'travelmate' ? (
              <MyTravelmate 
                data={travelerData || {}}
                isCreator={true}
                currentUserId={currentUserId}
                fetchTravelerData={handleUpdate}
              />
            ) : (
              <MyTravelinfo 
                data={travelerData || {}}
                currentUserId={currentUserId}
                fetchTravelinfos={handleUpdate}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}