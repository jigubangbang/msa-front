import React, { useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { USER_SIDEBAR } from "../../utils/sidebar";
import styles from "./UserManage.module.css"; // 공통 스타일 사용
import Sidebar from "../../components/common/SideBar/SideBar";

export default function UserInquiry() {

  // 사이드바
  const location = useLocation();
  const currentPath = location.pathname;

  const getActiveMenuItems = () => {
    return USER_SIDEBAR.map(item => ({
      ...item,
      active: currentPath === item.path || currentPath.startsWith(item.path + '/')
    }));
  };
  const finalMenuItems = getActiveMenuItems();

  return (
    <div className={styles.Container}>
      <Sidebar menuItems={finalMenuItems} />
      <div className={styles.content}>
        <h1 className={styles.title}>1:1 문의</h1>
        <div className={styles.formContainer}>
          <p>문의 페이지 내용</p>
        </div>
      </div>
    </div>
  );
}
