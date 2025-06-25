import React, { useState } from "react";
import { Link } from 'react-router-dom';

import styles from "./QuestMainPage.module.css";
import Sidebar from "../../../components/common/SideBar/SideBar";


export default function QuestListPage() {
 /*** ***/
  const menuItems = [
    {
      label: '퀘스트와 뱃지',            // 보이는 메뉴 이름
      icon: '/icons/sidebar/badge.svg', // 여기에 실제 SVG 경로 (asset으로 줘도 됨)
      path: '/quest',                   // 이동 경로
      active: true,                     // 지금 이 페이지에 있으면 true 주세요
      submenus: [                       // 하위 메뉴 있으면 리스트로 기입
        {
          label: '퀘스트 목록',
          path: '/quest/list'
        },
        {
          label: '뱃지 목록',
          path: '/badge/list',
        }
      ]
    },
    {
      label: '내 퀘스트/뱃지',
      icon: '/icons/sidebar/record.svg',
      path: '/my-quest',
      submenus: [                       // 하위 메뉴 있으면 리스트로 기입
        {
          label: '내 뱃지',
          path: '/my-quest/badge'
        },
        {
          label: '내 퀘스트 기록',
          path: '/my-quest/record',
        }
      ]
    },
    {
      label: '유저들',
      icon: '/icons/sidebar/user_search.svg',
      path: '/quest/user',
      submenus: [                       // 하위 메뉴 있으면 리스트로 기입
        {
          label: '유저 랭크',
          path: '/quest/rank'
        },
        {
          label: '유저 검색',
          path: '/quest/user-search',
        }
      ]
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