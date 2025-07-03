import React, { useState } from "react";
import { Link } from 'react-router-dom';
import styles from "./StyleGuidePage.module.css";
import Sidebar from "../../components/common/SideBar/SideBar";

export default function StyleGuidePage() {
 /*** ***/
  const menuItems = [
    {
      label: 'Badge',
      icon: '/icons/sidebar/badge.svg', // 여기에 실제 SVG 경로
      path: '/style-guide/dashboard',
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

  const [activeTab, setActiveTab] = useState("tab1");

  return (
    <div className={styles.styleGuideContainer}>
      <Sidebar menuItems={menuItems} />
      <div className={styles.content}>
        <h1>Style Guide Page</h1>
        <p>사이드바가 있는 스타일 가이드 페이지입니다.</p>

        <section>
          <h2>📌 타이포그래피</h2>
          <p className={styles.textLarge}>큰 텍스트 - 24px Bold</p>
          <p className={styles.textMedium}>중간 텍스트 - 18px Regular</p>
          <p className={styles.textSmall}>작은 텍스트 - 14px Light</p>
          <a href="#" className={styles.link}>링크 텍스트 예시</a>
        </section>

        <section>
          <h2>🔘 버튼</h2>
          <button className={styles.btnLarge}>큰 버튼</button>
          <button className={styles.btnMedium}>중간 버튼</button>
          <button className={styles.btnSmall}>작은 버튼</button>
          <button className={styles.btnDisabled} disabled>비활성화 버튼</button>
        </section>

        <section>
          <h2>✍️ 입력 요소</h2>
          <input className={styles.input} placeholder="텍스트 입력" />
          <select className={styles.select}>
            <option>옵션 1</option>
            <option>옵션 2</option>
          </select>
          <input type="date" className={styles.input} />
          <div>
            <label><input type="checkbox" /> 체크박스</label>
            <label><input type="radio" name="radio" /> 라디오</label>
          </div>
        </section>

        <section>
          <h2>📷 이미지</h2>
          <img src="./image_example.jpg" alt="배너 예시" className={styles.imageBanner} />
          <div className={styles.profileCard}>
            <img src="./profile_example.jpg" alt="프로필" className={styles.profileImage} />
            <span>사용자 이름</span>
          </div>
        </section>

        <section>
          <h2>📑 탭 메뉴</h2>
          <div className={styles.tabs}>
            <button className={activeTab === "tab1" ? styles.activeTab : styles.inactiveTab} onClick={() => setActiveTab("tab1")}>탭 1</button>
            <button className={activeTab === "tab2" ? styles.activeTab : styles.inactiveTab} onClick={() => setActiveTab("tab2")}>탭 2</button>
          </div>
          <div className={styles.tabContent}>
            {activeTab === "tab1" ? "탭 1의 내용입니다." : "탭 2의 내용입니다."}
          </div>
        </section>

        <section>
          <h2>⏳ 스켈레톤 박스</h2>
          <div className={styles.skeletonBox}></div>
        </section>

        <section>
          <h2>🚨 모달 / 알림</h2>
          <div className={styles.modal}>모달 예시</div>
          <div className={styles.toast}>토스트 알림 예시</div>
        </section>

        <section>
          <h2>🎨 색상 팔레트</h2>
          <div className={styles.colorBoxPrimary}>Primary Color</div>
          <div className={styles.colorBoxSecondary}>Secondary Color</div>
          <div className={styles.colorBoxAccent}>Accent Color</div>
        </section>

      </div>
    </div>
  );
}