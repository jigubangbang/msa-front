import React from "react";
import { useLocation } from "react-router-dom";
import { ADMIN_SIDEBAR } from "../../utils/sidebar";
import styles from "./AdminLayout.module.css";
import Sidebar from "../../components/common/SideBar/SideBar";
import UserManage from "../../components/admin/UserManage";

export default function AdminUser() {
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
        <div className={styles.formContainer}>
          <UserManage />
        </div>
      </div>
    </div>
  );
}
