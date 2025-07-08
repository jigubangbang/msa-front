import React, { useState } from "react";
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
    return ADMIN_SIDEBAR.map((item) => ({
      ...item,
      active:
        currentPath === item.path || currentPath.startsWith(item.path + "/"),
    }));
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
