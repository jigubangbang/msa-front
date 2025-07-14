import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {jwtDecode} from "jwt-decode";

import styles from "./QuestAdminPage.module.css";
import Sidebar from "../../../components/common/SideBar/SideBar";

import { QUEST_SIDEBAR } from "../../../utils/sidebar";
import BadgeModifyForm from "../../../components/quest-admin/BadgeModifyForm";
import BadgeCreateForm from "../../../components/quest-admin/BadgeCreateForm";
import QuestCreateForm from "../../../components/quest-admin/QuestCreateForm";
import QuestModifyForm from "../../../components/quest-admin/QuestModifyForm";
// import QuestModifyForm from "../../../components/quest-admin/QuestModifyForm";
// import BadgeCreateForm from "../../../components/quest-admin/BadgeCreateForm";
// import QuestCreateForm from "../../../components/quest-admin/QuestCreateForm";

export default function AdminFormPage({page}) {
  const [isLogin, setIsLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const {id, badgeId, questId} = useParams(); 
  
  const location = useLocation();
  const currentPath = location.pathname;

  const getPageType = () => {
    if (page) return page; 
    
    if (currentPath.includes('/badge/new')) return 'badge-create';
    if (currentPath.includes('/quest/new')) return 'quest-create';
    if (currentPath.includes('/badge/') && currentPath.includes('/modify')) return 'badge';
    if (currentPath.includes('/quest/') && currentPath.includes('/modify')) return 'quest';
    
    return 'unknown';
  };

  const pageType = getPageType();

  const getEntityId = () => {
    if (badgeId) return parseInt(badgeId);
    if (questId) return parseInt(questId);
    if (id) return parseInt(id);
    return null;
  };

  const entityId = getEntityId();

  //SideBar//
  const getActiveMenuItems = () => {
    return QUEST_SIDEBAR(isAdmin).map(item => {
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
                setIsAdmin(false);
                return;
            }
            
            setIsLogin(true);
            
            const userRole = decoded.role || decoded.authorities;
            const isAdminUser = userRole === 'ROLE_ADMIN' || 
                               (Array.isArray(userRole) && userRole.includes('ROLE_ADMIN'));
            setIsAdmin(isAdminUser);
            
        } catch (error) {
            console.error("토큰 디코딩 오류:", error);
            localStorage.removeItem("accessToken");
            setIsLogin(false);
            setIsAdmin(false);
        }
    } else {
        setIsLogin(false);
        setIsAdmin(false);
    }
}, []);

  // 뱃지 관련 핸들러
  const handleBadgeClose = (badgeId) => {
    window.scrollTo(0, 0);
    console.log("뱃지 폼 닫기", badgeId);
    
    if (pageType === 'badge-create') {
      navigate('/quest-admin/badge');
    } else {
      navigate(`/quest-admin/badge/${badgeId || entityId}`);
    }
  };

  const handleBadgeSave = (badgeId) => {
    window.scrollTo(0, 0);
    console.log("뱃지 저장", badgeId);
    
    if (pageType === 'badge-create') {
      navigate('/quest-admin/badge');
    } else {
      navigate(`/quest-admin/badge/${badgeId || entityId}`); 
    }
  };


  const handleQuestClose = (questId) => {
    window.scrollTo(0, 0);
    console.log("퀘스트 폼 닫기", questId);
    
    if (pageType === 'quest-create') {
      navigate('/quest-admin/quest');
    } else {
      navigate(`/quest-admin/quest/${questId || entityId}`);
    }
  };

  const handleQuestSave = (questId) => {
    window.scrollTo(0, 0);
    console.log("퀘스트 저장", questId);
    
    if (pageType === 'quest-create') {
      navigate('/quest-admin/quest');
    } else {
      navigate(`/quest-admin/quest/${questId || entityId}`);
    }
  };

  
  const renderFormComponent = () => {
    switch (pageType) {
      case 'badge':
        return (
          <BadgeModifyForm 
            badgeId={entityId} 
            onClose={handleBadgeClose} 
            onSave={handleBadgeSave}
          />
        );
      
      case 'badge-create':
        return (
          <BadgeCreateForm 
            onClose={handleBadgeClose} 
            onSave={handleBadgeSave}
          />
        );
      
      case 'quest':
        return (
          <QuestModifyForm
            questId={entityId}
            onClose={handleQuestClose} 
            onSave={handleBadgeSave}
          />
        );
      
      case 'quest-create':
        return (
          <QuestCreateForm
            onClose={handleQuestClose} 
            onSave={handleQuestSave}
          />
        );
      
      default:
        return (
          <div className={styles.error}>
            <h2>알 수 없는 페이지 타입</h2>
            <p>페이지 타입: {pageType}</p>
            <p>경로: {currentPath}</p>
          </div>
        );
    }
  };

  if (!isAdmin) {
    return (
      <div className={styles.Container}>
        <Sidebar menuItems={finalMenuItems} isLogin={isLogin}/>
        <div className={styles.content}>
          <div className={styles.loading}>접근 권한이 없습니다</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.Container}>
      <Sidebar menuItems={finalMenuItems} isAdmin={isAdmin} isLogin={isLogin}/>

      <div className={styles.content}>
        <div className={styles.contentWrapper}>
          {renderFormComponent()}
        </div>
      </div>
    </div>
  );
}