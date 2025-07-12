import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from 'react-router-dom';

import styles from "./RankListPage.module.css";
import Sidebar from "../../../components/common/SideBar/SideBar";
import RankingList from "../../../components/rank/RankList/RankList";
import UserInfoPanel from "../../../components/rank/UserInfoPanel/UserInfoPanel";
import API_ENDPOINTS from "../../../utils/constants";
import { QUEST_SIDEBAR } from "../../../utils/sidebar";
import api from "../../../apis/api";
import {jwtDecode} from "jwt-decode";

export default function RankListPage() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [userQuests, setUserQuests] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLogin, setIsLogin] = useState(null);

  // 토큰 검증 및 사용자 정보 설정
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    
    if (token) {
        try {
            const decoded = jwtDecode(token);
            console.log("디코딩된 토큰:", decoded);
             console.log('JWT Access Token:', token);
            
            const currentTime = Math.floor(Date.now() / 1000);
            if (decoded.exp && decoded.exp < currentTime) {
                localStorage.removeItem("accessToken");
                setIsLogin(false);
                setIsAdmin(false);
                setCurrentUserId(null);
                return;
            }
            
            setIsLogin(true);
            
            const extractedUserId = decoded.sub || decoded.userId || decoded.user_id || decoded.id || decoded.username;
            console.log("추출된 userId:", extractedUserId);
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

  // currentUserId가 설정된 후에 사용자 데이터 가져오기
  useEffect(() => {
    if (isLogin && currentUserId) {
      console.log("사용자 데이터 가져오기 시작, currentUserId:", currentUserId);
      fetchUser();
      fetchUserQuests();
      fetchUserBadges();
    }
  }, [isLogin, currentUserId]);
  
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

  const fetchUser = useCallback(async () => {
    if (!currentUserId) {
      console.error("currentUserId가 설정되지 않았습니다.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`${API_ENDPOINTS.QUEST.USER}/journey`, {
        headers: {
          'User-Id': currentUserId
        }
      });

      setUser(response.data);
      console.log("User data fetched:", response.data);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  const fetchUserBadges = useCallback(async () => {
    if (!currentUserId) {
      console.error("currentUserId가 설정되지 않았습니다.");
      return;
    }

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
      console.error("Failed to fetch user badge data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  const fetchUserQuests = useCallback(async () => {
    if (!currentUserId) {
      console.error("currentUserId가 설정되지 않았습니다.");
      return;
    }

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
  }, [currentUserId]);

  const calculatePerformance = (completed, inProgress) => {
    const completedCount = completed || 0;
    const inProgressCount = inProgress || 0;
    const total = completedCount + inProgressCount;
    
    if (total === 0) return "0%";
    return Math.round((completedCount / total) * 100) + "%";
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
      <Sidebar menuItems={finalMenuItems} isAdmin={isAdmin}/>

      <div className={styles.content}>
        <div className={styles.contentWrapper}>
          <RankingList myUserId={user?.user_id || ""} currentUserId={currentUserId}/>

          <UserInfoPanel 
            user={user}
            userQuests={userQuests}
            calculatePerformance={calculatePerformance}
            isLogin = {isLogin}
          />
        </div>
      </div>
    </div>
  );
}