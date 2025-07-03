import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../apis/api";
import API_ENDPOINTS from "../../utils/constants";
import { USER_SIDEBAR } from "../../utils/sidebar";

import styles from "./UserLayout.module.css";
import Sidebar from "../../components/common/SideBar/SideBar";
import UserInfoChange from "../../components/user/UserInfoChange";
import PasswordChange from "../../components/user/PasswordChange";

import { Circles } from 'react-loader-spinner';

export default function UserManage() {
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const navigate = useNavigate();

  // 사이드바
  const location = useLocation();
  const currentPath = location.pathname;

  const getActiveMenuItems = () => {
    return USER_SIDEBAR.map((item) => {
      let isActive = false;

      if (item.submenu) {
        isActive = item.path === currentPath;
      } else {
        isActive =
          currentPath === item.path || currentPath.startsWith(item.path + "/");
      }
      return {
        ...item,
        active: isActive,
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
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get(`${API_ENDPOINTS.USER}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserInfo(response.data);
    } catch (err) {
      console.error("Failed to fetch user info", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.Container}>
      <Sidebar menuItems={finalMenuItems} />
      <div className={styles.content}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <Circles 
              height="50" 
              width="50" 
              color="#000" 
              ariaLabel="circles-loading"
            />
          </div>
        ) : (
          <div className={styles.formContainer}>
            <UserInfoChange userInfo={userInfo} onUpdate={fetchUserInfo} />
            <PasswordChange />
          </div>
        )}
      </div>
    </div>
  );
}
