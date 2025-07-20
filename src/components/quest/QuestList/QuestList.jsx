import React, { useState, useEffect } from 'react';
import API_ENDPOINTS from '../../../utils/constants';
import styles from './QuestList.module.css';
import Dropdown from '../../common/Dropdown';
import { useNavigate } from 'react-router-dom';
import QuestActionModal from '../../modal/QuestActionModal/QuestActionModal';
import api from '../../../apis/api';
import CirclesSpinner from '../../common/Spinner/CirclesSpinner';


const QuestListCard = ({ quest, onJoin, onDetail, isLogin, onLoginClick}) => {

  const getDifficultyText = (difficulty) => {
    switch(difficulty) {
      case 'EASY': return '초급';
      case 'MEDIUM': return '중급';
      case 'HARD': return '고급';
      default: return difficulty;
    }
  };

  const getStarCount = (difficulty) => {
    switch(difficulty) {
      case 'EASY': return 1;
      case 'MEDIUM': return 3;
      case 'HARD': return 5;
      default: return 1;
    }
  };

  


  const calculateCompletionRate = () => {
    const total = quest.count_in_progress + quest.count_completed;
    if (total === 0) return 0;
    return Math.round((quest.count_completed / total) * 100);
  };

  return (
   <div className={styles.questCard} onClick={() => onDetail(quest)}>
      {/* 별 장식 */}
      <div className={styles.starDecoration}>
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} className={styles.star}>
            {index < getStarCount(quest.difficulty) ? '★' : '☆'}
          </span>
        ))}
      </div>
      
      {/* 퀘스트 아이콘 */}
      <div className={styles.questIcon}>
        <img src={quest.icon || "/icons/common/unknwon_badge.png"} alt="quest icon" />
      </div>
      
      {/* 퀘스트 정보 */}
        <div className={styles.questTitle}>{quest.title}</div>
        <div className={styles.questInfo}>
          <div className={styles.questMeta}>
            <span className={styles.label}>난이도</span>
            <span className={styles.value}>{getDifficultyText(quest.difficulty)}</span>
            <span className={styles.label2}>XP</span>
            <span className={styles.value}>{quest.xp}</span>
          </div>

          <div className={styles.questContent}>
            <div className={styles.questStats}>
              <div className={styles.statText}>
                현재 {quest.count_in_progress}명 도전 중
              </div>
              <div className={styles.statText}>
                완료율 {calculateCompletionRate()}%
              </div>
            </div>

            <div className={styles.questButton}>
              {quest.status === "INACTIVE" ? (
                <button 
                  className={styles.inactiveButton}
                  disabled
                >
                  시즌 종료
                </button>
              ) : !isLogin || quest.user_status == "GIVEN_UP" || !quest.user_status ? (
                <button 
                  className={styles.joinButton}
                  onClick={(e) => {
                    e.stopPropagation(); 
                    onJoin(quest);
                  }}>
                  <img src="/icons/common/check.svg" className={styles.buttonIcon} alt="check icon"/>
                  도전하기
                </button>
              ) : (
                quest.user_status == "IN_PROGRESS" ? (
                  <button 
                      className={styles.joiningButton}
                      onClick={(e) => {
                        e.stopPropagation(); 
                        onDetail(quest)
                      }}>
                      <img src="/icons/common/check.svg" className={styles.buttonIcon} alt="check icon"/>
                    도전 중
                  </button>
                ):(
                  <button 
                      className={styles.endButton}
                      onClick={(e) => {
                        e.stopPropagation(); 
                        onDetail(quest)
                      }}>
                      <img src="/icons/common/check.svg" className={styles.buttonEndIcon} alt="check icon"/>
                    도전 완료
                  </button>
                )
              )}
            </div>
            
          </div>
      </div>
    </div>
  );
};

const QuestList = ( { isLogin, onOpenModal, onQuestUpdate, currentUserId, onLoginClick} ) => {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: 0,
    difficulty: '',
    sortOption: 'default'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [questsPerPage] = useState(16); // 4x4 = 16개
  const [totalPages, setTotalPages] = useState(1);

  const [selectedQuest, setSelectedQuest] = useState(null);

    const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: null
  });

  const navigate = useNavigate();

  const categories = [
    { value: 0, label: '전체' },
    { value: 1, label: '첫 발걸음' },
    { value: 2, label: '글쓰기/기록' },
    { value: 3, label: '음식/맛집' },
    { value: 4, label: '문화 체험' },
    { value: 5, label: '자연 체험' },
    { value: 6, label: '여행 생활' },
    { value: 7, label: '소통/공유' },
    { value: 8, label: '고난이도 도전' },
    { value: 9, label: '특수 조건' },
    { value: 10, label: '기간 제한' }
  ];

  const difficulties = [
    { value: '', label: '전체' },
    { value: 'EASY', label: 'Easy' },
    { value: 'MEDIUM', label: 'Normal' },
    { value: 'HARD', label: 'Hard' }
  ];

  const sortOptions = [
    { value: '', label: '기본' },
    { value: 'latest', label: '최신순' },
    { value: 'oldest', label: '오래된순' },
    { value: 'xp_high', label: 'XP (높은순)' },
    { value: 'xp_low', label: 'XP (낮은순)' }
  ];

useEffect(() => {
  if (isLogin !== null) { 
    fetchQuests();
  }
}, [filters, currentPage, isLogin]);

  const fetchQuests = async () => {
    setLoading(true);
    try {
      const params = {
        pageNum: 1, 
        category: filters.category,
        ...(filters.sortOption && { sortOption: filters.sortOption }),
        ...(filters.difficulty && { difficulty: filters.difficulty }),
        limit: 100
      };

      
      const endpoint = isLogin
    ? `${API_ENDPOINTS.QUEST.USER}/list`
    : `${API_ENDPOINTS.QUEST.PUBLIC}/list`;

      const config = { params };

      if (isLogin) {
          config.headers = {
              'User-Id': currentUserId
          };
      }

      const response = await api.get(endpoint, config);
      const allQuests = response.data.quests || [];
      setQuests(allQuests);
      setTotalPages(Math.ceil(allQuests.length / questsPerPage));
    } catch (err) {
      console.error("Failed to fetch quests", err);
      setQuests([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };





  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1);
  };

   const getSortDisplayText = () => {
    if (!filters.sortOption) return "정렬";
    const selected = sortOptions.find(opt => opt.value === filters.sortOption);
    return selected ? selected.label : "정렬";
  };

  const handleJoinQuest = (quest) => {
    console.log(isLogin);
    if (!isLogin && onLoginClick){
      onLoginClick();
      return;
    }

    console.log('Join quest:', quest);
      setSelectedQuest(quest);
            setActionModal({
      isOpen: true,
      type: 'challenge'
    });
  };

  const handleQuestDetail = (quest) => {
    if (onOpenModal && quest.id) {
        onOpenModal(quest.id);
      }
  };

  const handleSortChange = (option) => {
    handleFilterChange('sortOption', option.value);
  };


  // 현재 페이지에 표시할 퀘스트들
  const startIndex = (currentPage - 1) * questsPerPage;
  const endIndex = startIndex + questsPerPage;
  const currentQuests = quests.slice(startIndex, endIndex);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handlePageIndicatorClick = (pageIndex) => {
    setCurrentPage(pageIndex);
  };

    const handleActionModalClose = () => {
      
  setActionModal({
    isOpen: false,
    type: null
  });
  setSelectedQuest(null);
};

  const handleActionSuccess = () => {
    fetchQuests();
    if (onQuestUpdate && selectedQuest) {
      onQuestUpdate(selectedQuest.id);
    }
    
  };
  

  if (loading || isLogin === null) {
    return (
      <CirclesSpinner/>
    );
  }

  return (
    <div className={styles.questList}>
      {/* 헤더와 필터 */}
      <div className={styles.header}>
        <h2 className={styles.title}>도전 가능한 퀘스트</h2>
        <Dropdown 
          defaultOption={getSortDisplayText()}
          options={sortOptions}
          onSelect={handleSortChange}
        />
      </div>

      {/* 필터 토글 */}
      <div className={styles.filters}>
        {/* 카테고리 필터 */}
        <div className={styles.filterGroup}>
          <div className={styles.filterButtons}>
            {categories.map((category) => (
              <button
                key={category.value}
                className={`${styles.filterButton} ${
                  filters.category === category.value ? styles.active : ''
                }`}
                onClick={() => handleFilterChange('category', category.value)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* 난이도 필터 */}
        <div className={styles.filterGroup}>
          <div className={styles.filterButtons}>
            {difficulties.map((difficulty) => (
              <button
                key={difficulty.value}
                className={`${styles.filterButton} ${
                  filters.difficulty === difficulty.value ? styles.active : ''
                }`}
                onClick={() => handleFilterChange('difficulty', difficulty.value)}
              >
                {difficulty.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 퀘스트 그리드 */}
      <div className={styles.questGrid}>
        {currentQuests.length > 0 ? (
          currentQuests.map((quest) => (
            <QuestListCard
              key={quest.id}
              quest={quest}
              onJoin={handleJoinQuest}
              onDetail={handleQuestDetail}
              isLogin={isLogin}
            />
          ))
        ) : (
          <div className={styles.emptyState}>
            <p>조건에 맞는 퀘스트가 없습니다</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.carouselControls}>
          <button 
            className={styles.navBtn} 
            onClick={prevPage}
            disabled={currentPage === 1}
          >
            ←
          </button>
          
          <div className={styles.pageIndicators}>
            {Array.from({ length: totalPages }, (_, i) => (
              <div
                key={i}
                className={`${styles.indicator} ${i + 1 === currentPage ? styles.active : ''}`}
                onClick={() => handlePageIndicatorClick(i + 1)}
              />
            ))}
          </div>
          
          <button 
            className={styles.navBtn} 
            onClick={nextPage}
            disabled={currentPage === totalPages}
          >
            →
          </button>
        </div>
      )}

    {/* 액션 확인 모달 */}
    {actionModal.isOpen && selectedQuest && (
      <QuestActionModal
       currentUserId={currentUserId}
        isOpen={actionModal.isOpen}
        onClose={handleActionModalClose}
        actionType={actionModal.type}
        questTitle={selectedQuest.title}
        quest_id={selectedQuest.id}
        onSuccess={handleActionSuccess}
      />
    )}
    </div>
  );
};

export default QuestList;