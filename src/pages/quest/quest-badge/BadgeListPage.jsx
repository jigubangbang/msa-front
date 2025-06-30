import React, { useEffect, useState } from "react";
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

import styles from "./BadgeListPage.module.css";
import Sidebar from "../../../components/common/SideBar/SideBar";

import UserInfoPanel from "../../../components/rank/UserInfoPanel/UserInfoPanel";
import API_ENDPOINTS from "../../../utils/constants";
import { QUEST_SIDEBAR } from "../../../utils/sidebar";
import RankQuestList from "../../../components/rank/RankQuestList/RankQuestList";



export default function BadgeListPage() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [userQuests, setUserQuests] = useState([]);

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
    fetchUser();
    fetchUserQuests();
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
          <RankQuestList myUserId={user?.user_id || ""}/>

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