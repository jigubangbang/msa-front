import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ADMIN_SIDEBAR } from "../../utils/sidebar";
import styles from "./AdminLayout.module.css";
import Sidebar from "../../components/common/SideBar/SideBar";
import UserManage from "../../components/admin/UserManage";
import { Circles } from "react-loader-spinner";

export default function AdminUser() {
  const [loading, setLoading] = useState(false);

  // 사이드바
  const location = useLocation();
  const currentPath = location.pathname;

  const getActiveMenuItems = () => {
    return ADMIN_SIDEBAR.map((item) => {
      const isMainActive =
        currentPath === item.path || currentPath.startsWith(item.path + "/");

      let submenus = [];
      let isSubmenuActive = false;

      if (item.submenus) {
        submenus = item.submenus.map((submenu) => {
          const isActive =
            currentPath === submenu.path ||
            currentPath.startsWith(submenu.path + "/");

          if (isActive) isSubmenuActive = true;

          return { ...submenu, active: isActive };
        });
      }

      if (item.label === "콘텐츠 관리" && item.submenus) {
        submenus = item.submenus.map((submenu) => {
          let isActive = false;

          if (
            submenu.path === "/admin/content/posts" &&
            (currentPath === "/admin/content/posts" ||
              currentPath.startsWith("/admin/content/posts/"))
          ) {
            isActive = true;
          } else if (
            submenu.path === "/admin/content/comments" &&
            (currentPath === "/admin/content/comments" ||
              currentPath.startsWith("/admin/content/comments/"))
          ) {
            isActive = true;
          } else if (
            submenu.path === "/admin/content/groups" &&
            (currentPath === "/admin/content/groups" ||
              currentPath.startsWith("/admin/content/groups/"))
          ) {
            isActive = true;
          }
          if (isActive) isSubmenuActive = true;
          return { ...submenu, active: isActive };
        });
      }

      return {
        ...item,
        active: isMainActive || isSubmenuActive,
        submenus,
      };
    });
  };

  const finalMenuItems = getActiveMenuItems();

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
            <UserManage />
          </div>
        )}
      </div>
    </div>
  );
}
