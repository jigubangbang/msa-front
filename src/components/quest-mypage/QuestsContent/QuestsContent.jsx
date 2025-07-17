import React, { useEffect, useState, useCallback } from "react";
import styles from './QuestsContent.module.css';
import API_ENDPOINTS from "../../../utils/constants";
import ReactDOM from 'react-dom';
import BadgeModal from "../../modal/BadgeModal/BadgeModal";
import QuestModal from "../../modal/QuestModal/QuestModal";
import QuestCertificationViewModal from "../../modal/QuestCertificationViewModal/QuestCertificationViewModal";
import api from "../../../apis/api";
import CirclesSpinner from "../../common/Spinner/CirclesSpinner";


const QuestsContent = ({ userInfo, isLogin, onUpdate, currentUserId }) => {
    const [loading, setLoading] = useState(false);
  const [filteredQuests, setFilteredQuests] = useState([]);
  const [filters, setFilters] = useState({
    category: 0,
    status: 'all'
  });

      const [certiModal, setCertiModal] = useState({
        isOpen: false,
        questUserId: null
      })

  // Modal states 
    const [showQuestModal, setShowQuestModal] = useState(false);
    const [showBadgeModal, setShowBadgeModal] = useState(false);
    const [selectedQuest, setSelectedQuest] = useState(null);
    const [selectedBadge, setSelectedBadge] = useState(null);

    
  //quest modal
const openQuestModal = useCallback( async (quest_id) => {
  setLoading(true);
  try {
    const endpoint = isLogin 
    ? `${API_ENDPOINTS.QUEST.USER}/detail/${quest_id}`
    : `${API_ENDPOINTS.QUEST.PUBLIC}/detail/${quest_id}`;

const config = {};

if (isLogin) {
    config.headers = {
        'User-Id': currentUserId
    };
}

const response = await api.get(endpoint, config);
    setSelectedQuest(response.data);
    setShowQuestModal(true);
    console.log("Quest data fetched:", response.data);
  } catch (error) {
    console.error("Failed to fetch quest data:", error);
  } finally {
    setLoading(false);
  }
}, [isLogin]);

const closeQuestModal = () => {
  setShowQuestModal(false);
  setSelectedQuest(null);
};

// 모달
const openBadgeModal = useCallback(async (badge_id) => {
  setLoading(true);
  try {
    const endpoint = isLogin 
        ? `${API_ENDPOINTS.QUEST.USER}/badges/${badge_id}`
        : `${API_ENDPOINTS.QUEST.PUBLIC}/badges/${badge_id}`;

    const config = {};

    // 로그인 상태일 때만 User-Id 헤더 추가
    if (isLogin) {
        config.headers = {
            'User-Id': currentUserId
        };
    }

    const response = await api.get(endpoint, config);
    setSelectedBadge(response.data);
    setShowBadgeModal(true);
    console.log("Badge data fetched:", response.data);
  } catch (error) {
    console.error("Failed to fetch badge data:", error);
  } finally {
    setLoading(false);
  }
},[isLogin]);

const closeBadgeModal = () => {
  setShowBadgeModal(false);
  setSelectedBadge(null);
};

// 퀘스트에서 배지 클릭 핸들러
const handleBadgeClickFromQuest = (badge_id) => {
  closeQuestModal(); // 퀘스트 모달 닫기
  openBadgeModal(badge_id); // 배지 모달 열기
};

// 배지에서 퀘스트 클릭 핸들러
const handleQuestClickFromBadge = (quest_id) => {
  closeBadgeModal(); // 배지 모달 닫기
  openQuestModal(quest_id); // 퀘스트 모달 열기
};

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

  const statusOptions = [
    { value: 'all', label: '전체' },
    { value: 'IN_PROGRESS', label: '진행 중' },
    { value: 'COMPLETED', label: '완료' },
    { value: 'GIVEN_UP', label: '포기' }
  ];

  const getCategoryLabel = (categoryValue) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const extractDescription = (description) => {
    if (!description) return '';
    const parts = description.split('✅ 퀘스트 조건:');
    return parts.length > 1 ? parts[1].trim() : description;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'IN_PROGRESS': { text: 'In Progress', className: 'inProgress' },
      'COMPLETED': { text: 'Completed', className: 'completed' },
      'GIVEN_UP': { text: 'Given Up', className: 'givenUp' }
    };
    
    const config = statusConfig[status] || { text: status, className: 'default' };
    return (
      <span className={`${styles.statusBadge} ${styles[config.className]}`}>
        {config.text}
      </span>
    );
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleCertificationClick = (e, questUserId) => {
    e.stopPropagation();
    setCertiModal({
      isOpen: true,
      questUserId: questUserId
    })
  };

  

const handleViewModalClose = () => {
  setCertiModal({
    isOpen: false,
    questUserId: null
  });
};


  const handleQuestRowClick = (quest) => {
    if (quest.quest_id) {
        openQuestModal(quest.quest_id);
      }
  }

  const handleUpdate = () => {
    if(onUpdate){
        onUpdate();
    }
  }

  useEffect(() => {
    if (!userInfo?.quest) return;

    // 진행 중인 퀘스트와 완료된 퀘스트를 합치기
    const allQuests = [
      ...(userInfo.quest.in_progress_quests || []),
      ...(userInfo.quest.completed_quests || [])
    ];

    let filtered = allQuests;

    // 카테고리 필터 적용
    if (filters.category !== 0) {
      filtered = filtered.filter(quest => quest.category === filters.category);
    }

    // 상태 필터 적용
    if (filters.status !== 'all') {
      filtered = filtered.filter(quest => quest.status === filters.status);
    }

    setFilteredQuests(filtered);
  }, [userInfo, filters]);

  if (!userInfo?.quest) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>퀘스트 데이터를 불러오는 중...</div>
      </div>
    );
  }

   if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <CirclesSpinner/>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.totalCount}>
        총 {filteredQuests.length}개의 퀘스트를 진행 중이거나 완료했습니다.
      </div>

      {/* 카테고리 필터 */}
      <div className={styles.filters}>
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

        {/* 상태 필터 */}
        <div className={styles.filterGroup}>
          <div className={styles.filterButtons}>
            {statusOptions.map((status) => (
              <button
                key={status.value}
                className={`${styles.statusFilterButton} ${
                  filters.status === status.value ? styles.active : ''
                }`}
                onClick={() => handleFilterChange('status', status.value)}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 테이블 헤더 */}
      <div className={styles.tableHeader}>
        <div className={styles.headerCell}>퀘스트 ID</div>
        <div className={styles.headerCell}>상태</div>
        <div className={styles.headerCell}>카테고리</div>
        <div className={styles.headerCell}>제목</div>
        <div className={styles.headerCell}>난이도/XP</div>
        <div className={styles.headerCell}>시작</div>
        <div className={styles.headerCell}>완료</div>
        <div className={styles.headerCell}>설명</div>
        <div className={styles.headerCell}>액션</div>
      </div>

      {/* 테이블 바디 */}
      <div className={styles.tableBody}>
        {filteredQuests.length === 0 ? (
          <div className={styles.noQuests}>해당하는 퀘스트가 없습니다.</div>
        ) : (
          filteredQuests.map((quest) => (
            <div key={quest.quest_user_id} className={styles.tableRow}
            onClick={() => handleQuestRowClick(quest)}>
              <div className={styles.cell}>{quest.quest_id}</div>
              <div className={styles.cell}>{getStatusBadge(quest.status)}</div>
              <div className={styles.cell}>{getCategoryLabel(quest.category)}</div>
              <div className={styles.cell}>
                <div className={styles.questTitle}>{quest.title}</div>
              </div>
              <div className={styles.cell}>
                <div className={styles.questInfo}>
                  <span className={styles.difficulty}>{quest.difficulty}</span>
                  <span className={styles.separator}>/</span>
                  <span className={styles.xp}>{quest.xp}</span>
                </div>
              </div>
              <div className={styles.cell}>{formatDate(quest.started_at)}</div>
              <div className={styles.cell}>{formatDate(quest.completed_at)}</div>
              <div className={styles.cell}>
                <div className={styles.description}>
                  {extractDescription(quest.description)}
                </div>
              </div>
              <div className={styles.cell}>
                {quest.status === 'IN_PROGRESS' ? (
                  <span className={styles.noAction}>-</span>
                ) : (
                  <button
                    className={styles.certificationButton}
                    onClick={(e) => handleCertificationClick(e, quest.quest_user_id)}
                  >
                    인증 보기
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 모달들을 Portal로 body에 렌더링 */}
      {showQuestModal && ReactDOM.createPortal(
        <QuestModal 
          questData={selectedQuest} 
          onClose={closeQuestModal}
          onBadgeClick={handleBadgeClickFromQuest}
          isLogin={isLogin} 
          onQuestUpdate={handleUpdate}
           currentUserId={currentUserId}
        />,
        document.body
      )}

      {showBadgeModal && ReactDOM.createPortal(
        <BadgeModal 
          badgeData={selectedBadge} 
          onClose={closeBadgeModal}
          onQuestClick={handleQuestClickFromBadge}
          isLogin={isLogin} 
        />,
        document.body
      )}

      {certiModal.isOpen && ReactDOM.createPortal(
        <QuestCertificationViewModal
          isOpen={certiModal.isOpen}
          onClose={handleViewModalClose}
          questUserId={certiModal.questUserId}
          currentUserId={currentUserId}
        />,
        document.body
      )}

    </div>
  );
};

export default QuestsContent;