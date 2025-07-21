import React, { useState } from 'react';
import styles from './CategoryBrowse.module.css';
import woman_common from '../../../assets/community/user/woman.png';
import man_common from '../../../assets/community/user/man.png';
import woman from '../../../assets/community/user/20_woman.png';
import maam from '../../../assets/community/user/30_woman.png';
import man from '../../../assets/community/user/40_man.png';
import oldMan from '../../../assets/community/user/50_man.png';
import friends from '../../../assets/community/user/friends.png';
import family from '../../../assets/community/user/family.png';

const CategoryBrowse = ({ onCategorySelect }) => {
  const [activeTab, setActiveTab] = useState('지역');

  const categoryData = {
    지역: [
      { id: 'ASIA', name: '아시아', icon: '🌏' },
      { id: 'EUROPE', name: '유럽', icon: '🏰' },
      { id: 'NORTH_AMERICA', name: '북아메리카', icon: '🗽' },
      { id: 'SOUTH_AMERICA', name: '남아메리카', icon: '⛰️' },
      { id: 'AFRICA', name: '아프리카', icon: '🐘' },
      { id: 'OCEANIA', name: '오세아니아', icon: '🏝️' }
    ],
    대상: [
      { id: 1, name: '남성 전용 모임', icon: '🚹'},
      { id: 2, name: '여성 전용 모임', icon: '🚺'},
      { id: 3, name: '20대 모임', image: woman },
      { id: 4, name: '30대 모임', image: maam },
      { id: 5, name: '40대 모임', image: man },
      { id: 6, name: '50대 이상 모임', image: oldMan },
      { id: 7, name: '가족/아이 동반 모임', image: family },
      { id: 8, name: '친구 동반 모임', image: friends }
    ],
    테마: [
      { id: 9, name: '맛집 탐방 모임', icon: '🍜' },
      { id: 10, name: '등산/트레킹 모임', icon: '🏞️' },
      { id: 11, name: '사진 촬영 모임' , icon: '📸' },
      { id: 12, name: '유적지 탐방 모임', icon: '🏛️' },
      { id: 13, name: '축제/이벤트 참가 모임', icon: '🎭' },
      { id: 14, name: '자연 속 힐링 모임', icon: '🌿' },
      { id: 15, name: '액티비티/레포츠 모임', icon: '🏄' },
      { id: 16, name: '캠핑/차박 모임', icon: '⛺' }
    ],
    '여행 스타일': [
      { id: 'A', name: '열정트래블러', image: '/type/type_a.png' },
      { id: 'B', name: '느긋한여행가', image: '/type/type_b.png' },
      { id: 'C', name: '디테일플래너', image: '/type/type_c.png' },
      { id: 'D', name: '슬로우로컬러', image: '/type/type_d.png' },
      { id: 'E', name: '감성기록가', image: '/type/type_e.png' },
      { id: 'F', name: '혼행마스터', image: '/type/type_f.png' },
      { id: 'G', name: '맛집헌터', image: '/type/type_g.png' },
      { id: 'H', name: '문화수집가', image: '/type/type_h.png' },
      { id: 'I', name: '자연힐링러', image: '/type/type_i.png' },
      { id: 'J', name: '실속낭만러', image: '/type/type_j.png' }
    ]
  };

  const tabs = ['지역', '대상', '테마', '여행 스타일'];

  const handleCategoryClick = (category, tabType) => {
    if (onCategorySelect) {
      // 카테고리 타입에 따라 필터 데이터 구성
      let filterData = {};
      
      switch(tabType) {
        case '지역':
          filterData = { continent: [category.id] };
          break;
        case '대상':
          filterData = { targets: [category.id] };
          break;
        case '테마':
          filterData = { themes: [category.id] };
          break;
        case '여행 스타일':
          filterData = { styles: [category.id] };
          break;
        default:
          break;
      }
      
      console.log('선택된 카테고리:', { type: tabType, data: category, filter: filterData });
      onCategorySelect(filterData);
    }
  };

  return (
    <div className={styles.categoryBrowse}>
      <h3 className={styles.title}>카테고리별 둘러보기</h3>
      
      {/* 탭 메뉴 */}
      <div className={styles.tabMenu}>
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`${styles.tabButton} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 카테고리 그리드 */}
      <div className={styles.categoryGrid}>
        {categoryData[activeTab]?.map((item) => (
          <div
            key={item.id}
            className={styles.categoryCard}
            onClick={() => handleCategoryClick(item, activeTab)}
          >
            <div className={styles.categoryIcon}>
              {item.icon && item.icon}
              {item.image && <img src={item.image} alt={item.name} className={styles.categoryImage} />}
            </div>
            <div className={styles.categoryName}>
              {item.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryBrowse;