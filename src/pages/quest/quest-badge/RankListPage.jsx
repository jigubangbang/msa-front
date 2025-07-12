import React, { useEffect, useState } from "react";
import { Link, useLocation } from 'react-router-dom';

import styles from "./RankListPage.module.css";
import Sidebar from "../../../components/common/SideBar/SideBar";
import RankingList from "../../../components/rank/RankList/RankList";
import UserInfoPanel from "../../../components/rank/UserInfoPanel/UserInfoPanel";
import API_ENDPOINTS from "../../../utils/constants";
import { QUEST_SIDEBAR } from "../../../utils/sidebar";
import api from "../../../apis/api";

export default function RankListPage() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [userQuests, setUserQuests] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    //#NeedToChange
    setIsAdmin(true);
    fetchUser();
    fetchUserQuests();
    fectchUserBadges();
  }, []);

  
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


  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await api.get(`${API_ENDPOINTS.QUEST.USER}/journey`);
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
      const response = await api.get(`${API_ENDPOINTS.QUEST.USER}/badges/my`);
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
          <RankingList myUserId={user?.user_id || ""}/>

          <UserInfoPanel 
            user={user}
            userQuests={userQuests}
            calculatePerformance={calculatePerformance}
          />
        </div>
      </div>
    </div>
  );
}