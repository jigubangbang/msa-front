import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useParams} from 'react-router-dom';
import axios from 'axios';
import ReactDOM from 'react-dom';

import styles from "./QuestAdminPage.module.css";
import Sidebar from "../../../components/common/SideBar/SideBar";

import API_ENDPOINTS from "../../../utils/constants";
import { QUEST_SIDEBAR } from "../../../utils/sidebar";
import QuestModal from "../../../components/modal/QuestModal/QuestModal";
import BadgeModal from "../../../components/modal/BadgeModal/BadgeModal";


export default function QuestAdminPage({page}) {
  const [loading, setLoading] = useState(false);

  // Modal states 
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [selectedBadge, setSelectedBadge] = useState(null);
    const { userId } = useParams();

    const [isLogin, setIsLogin] = useState(true);
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
    setIsAdmin(true);
    setIsLogin(true);

    // if (token) {
    //   setIsLogin(true);
    //   fetchUserInfo();
    // }
  }, [isAdmin, page]);


  //랜더링 결정
  const renderContent = () => {

    switch (page) {
    //   case 'quest':
    //     return <BadgesContent {...commonProps} />;
    //   case 'badge':
    //     return <QuestsContent {...commonProps} />;
    //   case 'main':
    //   default:
    //     return <JourneyContent {...commonProps} />;
    }
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

  if(!isAdmin){
    return (
      <div className={styles.Container}>
        <Sidebar menuItems={finalMenuItems} isAdmin={isAdmin}/>
        <div className={styles.content}>
          <div className={styles.loading}>접근 권한이 없는 페이지입니다</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.Container}>
      <Sidebar menuItems={finalMenuItems} />

      <div className={styles.content}>
        <div className={styles.contentWrapper}>
            <h2>관리자 페이지</h2>
                {renderContent()}
        </div>
      </div>


    </div>
  );
}