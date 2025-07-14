import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './BoardCategoryBrowse.module.css';

const BoardCategoryBrowse = ({ category, onCategorySelect, isLogin }) => {
  const navigate = useNavigate();

  const categories = [
    { value: 0, label: '인기글', navigate:'popular'},
    { value: 1, label: '정보', navigate: 'info' },
    { value: 2, label: '추천', navigate: 'recommend' },
    { value: 3, label: '잡담', navigate: 'chat' },
    { value: 4, label: '질문', navigate: 'question' }
  ];

  const handleWriteClick = () => {
    if (isLogin) {
      navigate('/board/new');
    } else {
      alert('로그인이 필요한 서비스 입니다');
    }
  };

  return (
    <div className={styles.categoryBrowse}>
      <div className={styles.categoryButtons}>
        {categories.map((cat) => (
          <button
            key={cat.value}
            className={`${styles.categoryButton} ${
              category && category.includes(cat.value) ? styles.active : ''
            }`}
            onClick={() => navigate(`/board/${cat.navigate}`)}
          >
            {cat.label}
          </button>
        ))}
      </div>
      
      <button 
        className={styles.writeButton}
        onClick={handleWriteClick}
      >
        글쓰기
      </button>
    </div>
  );
};

export default BoardCategoryBrowse;