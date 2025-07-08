import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import styles from "./QuestAdminPage.module.css";
import Sidebar from "../../../components/common/SideBar/SideBar";

import { QUEST_SIDEBAR } from "../../../utils/sidebar";
import QuestAdminDetail from "../../../components/quest-admin/QuestAdminDetail";


export default function QuestAdminDetailPage() {
  const [isLogin, setIsLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const {questId} = useParams();
  

  //SideBar//
  const location = useLocation();
  const currentPath = location.pathname;

  const getActiveMenuItems = () => {
    return QUEST_SIDEBAR(isAdmin).map(item => {
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



  useEffect(()=>{
    const token = localStorage.getItem("accessToken");
    //#NeedToChange 토큰에서 잘 뽑아왔다고 가정
    setIsLogin(true);
    setIsAdmin(true);

    // if (token) {
    //   setIsLogin(true);
    // }
  }, []);


 if (!isAdmin) {
    return (
      <div className={styles.Container}>
        <Sidebar menuItems={finalMenuItems} />
        <div className={styles.content}>
          <div className={styles.loading}>접근 권한이 없습니다</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.Container}>
      <Sidebar menuItems={finalMenuItems} isAdmin={isAdmin}/>

      <div className={styles.content}>
        <div className={styles.contentWrapper}>
          <QuestAdminDetail questId={parseInt(questId)}/>
        </div>
      </div>


    </div>
  );
}