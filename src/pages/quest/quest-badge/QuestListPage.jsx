import React, { useState } from "react";
import { Link } from 'react-router-dom';

import styles from "./QuestMainPage.module.css";
import Sidebar from "../../../components/common/SideBar/SideBar";
import RankingList from "../../../components/rank/RankList/RankList";


export default function QuestListPage() {
 /*** ***/  
 const menuItems = [
    {
      label: '퀘스트와 뱃지',
      icon: '/icons/sidebar/badge.svg',
      path: '/quest',
      active: true
    },
    {
      label: '퀘스트 목록',
      path: '/quest/list',
      submenu: true,
      active: true
    },
    {
      label: '뱃지 목록',
      path: '/badge/list',
      submenu: true
    },
    {
      label: '내 퀘스트/뱃지',
      icon: '/icons/sidebar/record.svg',
      path: '/my-quest'
    },
    {
      label: '내 뱃지',
      path: '/my-quest/badge',
      submenu: true
    },
    {
      label: '내 퀘스트 기록',
      path: '/my-quest/record',
      submenu: true
    },
    {
      label: '유저들',
      icon: '/icons/sidebar/user_search.svg',
      path: '/quest/user'
    },
    {
      label: '유저 랭크',
      path: '/quest/rank',
      submenu: true
    },
    {
      label: '유저 검색',
      path: '/quest/user-search',
      submenu: true
    }
  ];
  /*** ***/

  //#NeedToChange myUserId
  return (
    <div className={styles.Container}>
      <Sidebar menuItems={menuItems} />
      <div className={styles.content}>
        <h1>Quest Page</h1>
        <RankingList myUserId="aaa"/>
      </div>
    </div>
  );
}