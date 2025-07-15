import React, { useEffect, useState} from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TRAVELER_SIDEBAR } from "../../../utils/sidebar";
import styles from "./BoardListPage.module.css";
import Sidebar from "../../../components/common/SideBar/SideBar";
import { jwtDecode } from 'jwt-decode';
import UserBoard from "../../../components/board/UserBoard/UserBoard";

export default function MyBoardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');

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
        
        const userRole = decoded.role || decoded.authorities;
        const isAdminUser = userRole === 'ROLE_ADMIN' ||
                            (Array.isArray(userRole) && userRole.includes('ROLE_ADMIN'));
        
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

  if (loading) {
    return (
      <div className={styles.Container}>
        <Sidebar menuItems={finalMenuItems} isLogin={isLogin}/>
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

          <UserBoard isLogin={isLogin} currentUserId={currentUserId}/>
        </div>
      </div>
    </div>
  );
}