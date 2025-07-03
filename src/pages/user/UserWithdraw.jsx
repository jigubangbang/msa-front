import React from "react";
import { useLocation } from "react-router-dom";
import { USER_SIDEBAR } from "../../utils/sidebar";
import styles from "./UserLayout.module.css";
import Sidebar from "../../components/common/SideBar/SideBar";
import WithdrawForm from "../../components/user/WithdrawForm";

export default function UserWithdraw() {
  // 사이드바
  const location = useLocation();
  const currentPath = location.pathname;

  const getActiveMenuItems = () => {
    return USER_SIDEBAR.map((item) => ({
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
          <WithdrawForm />
        </div>
      </div>
    </div>
  );
}
