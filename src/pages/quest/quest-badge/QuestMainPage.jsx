import React, { useState } from "react";
import { Link } from 'react-router-dom';

import styles from "./QuestMainPage.module.css";
import Sidebar from "../../../components/common/SideBar/SideBar";


export default function QuestMainPage() {
 /*** ***/
  const menuItems = [
    {
      label: '퀘스트와 뱃지',
      icon: '/icons/sidebar/badge.svg', // 여기에 실제 SVG 경로 (asset으로 줘도 됨)
      path: '/quest',
      active: true
    },
    {
      label: 'Notifications',
      icon: '/icons/notifications.svg',
      path: '/style-guide/notifications',
      badge: '4'
    },
    {
      label: 'Projects',
      icon: '/icons/projects.svg',
      path: '/style-guide/projects',
      submenus: [
        {
          label: 'All Projects',
          path: '/style-guide/projects/all'
        },
        {
          label: 'My Projects',
          path: '/style-guide/projects/my',
          active: true
        },
        {
          label: 'Archived',
          path: '/style-guide/projects/archived'
        }
      ]
    },
    {
      label: 'Tasks',
      icon: '/icons/tasks.svg',
      path: '/style-guide/tasks'
    },
    {
      label: 'Analytics',
      icon: '/icons/analytics.svg',
      path: '/style-guide/analytics',
      submenus: [
        {
          label: 'Overview',
          path: '/style-guide/analytics/overview'
        },
        {
          label: 'Reports',
          path: '/style-guide/analytics/reports',
          badge: '2'
        }
      ]
    },
    {
      label: 'Settings',
      icon: '/icons/settings.svg',
      path: '/style-guide/settings'
    },
    {
      label: 'Support',
      icon: '/icons/support.svg',
      path: '/style-guide/support'
    }
  ];
  /*** ***/

  return (
    <div className={styles.Container}>
      <Sidebar menuItems={menuItems} />
      <div className={styles.content}>
        <h1>Quest Page</h1>
        <p>사이드바가 있는 퀘스트 페이지입니다.</p>


      </div>
    </div>
  );
}