import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_ENDPOINTS from "../../utils/constants";
import { USER_SIDEBAR } from "../../utils/sidebar";

import styles from "./UserManage.module.css";
import Sidebar from "../../components/common/SideBar/SideBar";

export default function UserManage() {
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  
  const navigate = useNavigate();

  // 사이드바
  const location = useLocation();
  const currentPath = location.pathname;
  
  const getActiveMenuItems = () => {
    return USER_SIDEBAR.map(item => {
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

  const finalMenuItems = getActiveMenuItems(USER_SIDEBAR);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    setLoading(true);
    try {
      // 여기에 유저 정보 가져오는 API 호출
    } catch (err) {
      console.error("Failed to fetch user info", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.Container}>
      <Sidebar menuItems={finalMenuItems} />
      <div className={styles.content}>
        <h1 className={styles.title}>회원정보 수정</h1>
        
        {loading ? (
          <div className={styles.loading}>로딩 중...</div>
        ) : (
          <div className={styles.formContainer}>
            <p>회원정보 수정 페이지 내용이 여기에 들어갑니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}