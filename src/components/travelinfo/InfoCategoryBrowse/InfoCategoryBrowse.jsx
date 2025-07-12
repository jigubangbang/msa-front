import React from 'react';
import styles from './InfoCategoryBrowse.module.css';

const InfoCategoryBrowse = ({ onCategorySelect }) => {
  const categories = [
    { id: 1, label: '후기/팁', icon: '📝' },
    { id: 2, label: '질문/답변', icon: '❓' },
    { id: 3, label: '맛집/음식', icon: '🍜' },
    { id: 4, label: '항공/교통', icon: '✈️' },
    { id: 5, label: '한달살기/장기여행', icon: '🏠' },
    { id: 6, label: '자유주제', icon: '💬' },
    { id: 7, label: '아시아', icon: '🌏' },
    { id: 8, label: '유럽', icon: '🏰' },
    { id: 9, label: '미주', icon: '🗽' },
    { id: 10, label: '중동/아프리카', icon: '🦁' },
    { id: 11, label: '오세아니아', icon: '🏄‍♀️' },
    { id: 12, label: '국내', icon: '🏯' }
  ];

  const handleCategoryClick = (category) => {
    if (onCategorySelect) {
      console.log('선택된 카테고리:', category.id);
      onCategorySelect(category.id);
    }
  };

  return (
    <div className={styles.infoCategoryBrowse}>
      <h3 className={styles.title}>카테고리별 둘러보기</h3>
      
      {/* 카테고리 그리드 */}
      <div className={styles.categoryGrid}>
        {categories.map((category) => (
          <div
            key={category.id}
            className={styles.categoryCard}
            onClick={() => handleCategoryClick(category)}
          >
            <div className={styles.categoryIcon}>
              {category.icon}
            </div>
            <div className={styles.categoryName}>
              {category.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfoCategoryBrowse;