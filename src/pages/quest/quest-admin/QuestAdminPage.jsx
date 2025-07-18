import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import styles from "./QuestAdminPage.module.css";
import Sidebar from "../../../components/common/SideBar/SideBar";
import QuestAdminList from "../../../components/quest-admin/QuestAdminList";
import { QUEST_SIDEBAR } from "../../../utils/sidebar";
import BadgeAdminList from "../../../components/quest-admin/BadgeAdminList";
import { jwtDecode } from "jwt-decode";

export default function QuestAdminPage({ page }) {
  const [isLogin, setIsLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  //SideBar//
  const location = useLocation();
  const currentPath = location.pathname;

  const getActiveMenuItems = () => {
    return QUEST_SIDEBAR(isAdmin).map((item) => {
      let isActive = false;

      if (item.submenu) {
        isActive =
          currentPath === item.path || currentPath.startsWith(item.path + "/");
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

  const finalMenuItems = getActiveMenuItems();
  //SideBar//

  const handleQuestRowClick = (questId) => {
    navigate(`/quest-admin/quest/${questId}`);
  };

  const handleBadgeRowClick = (badgeId) => {
    navigate(`/quest-admin/badge/${badgeId}`);
  };

  const handleBadgeMModifyClick = (badge) => {
    navigate(`/quest-admin/badge/${badge.badge_id}/modify`);
  };

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
        const isAdminUser =
          userRole === "ROLE_ADMIN" ||
          (Array.isArray(userRole) && userRole.includes("ROLE_ADMIN"));
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

  if (!isAdmin) {
    return (
      <div className={styles.Container}>
        <Sidebar menuItems={finalMenuItems} isLogin={isLogin} />
        <div className={styles.content}>
          <div className={styles.contentWrapper}>
            <div className={styles.emptyContainer}>
              <p className={styles.emptyText}>접근 권한이 없습니다</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.Container}>
      <Sidebar menuItems={finalMenuItems} isAdmin={isAdmin} isLogin={isLogin} />

      <div className={styles.content}>
        <div className={styles.contentWrapper}>
          {page === "quest" ? (
            <QuestAdminList onQuestClick={handleQuestRowClick} />
          ) : (
            <BadgeAdminList
              onBadgeClick={handleBadgeRowClick}
              onBadgeModify={handleBadgeMModifyClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}
