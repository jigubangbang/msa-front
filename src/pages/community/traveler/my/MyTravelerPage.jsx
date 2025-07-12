import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import { TRAVELER_SIDEBAR } from "../../../../utils/sidebar";
import styles from "./MyTravelerPage.module.css";
import Sidebar from "../../../../components/common/SideBar/SideBar";

export default function MyTravelerPage({page}) {
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [activeTab, setActiveTab] = useState('travelmate'); // 'travelmate' 또는 'travelinfo'

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
    //#NeedToChange 토큰에서 잘 뽑아왔다고 가정
    setIsLogin(true);

    // if (token) {
    //   setIsLogin(true);
    // }
  }, []);

  // page prop이 변경될 때마다 activeTab 설정
  useEffect(() => {
    if (page) {
      console.log('받은 page prop:', page); // 디버깅용
      // page 값에 따라 activeTab 설정
      switch (page) {
        case "travelmate":
          setActiveTab('travelmate');
          break;
        case "travelinfo":
          setActiveTab('travelinfo'); // 오타 수정: travelminfo -> travelinfo
          break;
        default:
          setActiveTab('travelmate'); // 기본값
          break;
      }
    }
  }, [page]); // dependency를 page로 변경

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
              <div className={styles.travelmateSection}>
                {/* 여행자 모임 관련 컴포넌트들이 들어갈 자리 */}
                <div className={styles.placeholder}>
                  내 여행자 모임 컴포넌트 영역
                </div>
              </div>
            ) : (
              <div className={styles.travelinfoSection}>
                {/* 여행자 정보 공유방 관련 컴포넌트들이 들어갈 자리 */}
                <div className={styles.placeholder}>
                  내 여행자 정보 공유방 컴포넌트 영역
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}