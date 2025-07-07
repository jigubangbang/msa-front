import React, { useState } from 'react';
import ReactDOM from 'react-dom';

import styles from './BadgeItem.module.css';
import axios from 'axios';
import API_ENDPOINTS from '../../../../utils/constants';

const BadgeItem = ({ badge, onBadgeClick, isMine, onUpdate, isPinnedBadge }) => {
  const [hoveredBadge, setHoveredBadge] = useState(false);
  const [isPinning, setIsPinning] = useState(false);
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: null,
    resultMessage: '',
    isSuccessResult: false
  });

  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  // 배지 클릭 핸들러
  const handleBadgeClick = () => {
    onBadgeClick(badge);
  };

  // 배지 hover 핸들러
  const handleBadgeMouseEnter = () => {
    setHoveredBadge(true);
  };

  const handleBadgeMouseLeave = () => {
    setHoveredBadge(false);
  };

  const handlePinBadge = async (e) => {
    e.stopPropagation(); // 부모 클릭 이벤트 방지
    
    if (isPinning) return; // 중복 클릭 방지
    
    setIsPinning(true);
    
    try {
      const response = await axios.post(`${API_ENDPOINTS.QUEST.USER}/badges/${badge.badge_id}/pin`);
      
      if (response.status === 200) {
        // 성공 모달 표시
        setActionModal({
          isOpen: true,
          type: 'pin_success',
          resultMessage: '대표 뱃지로 설정되었습니다!',
          isSuccessResult: true
        });

        if(onUpdate){
          onUpdate();
        }
      }
    } catch (error) {
      console.error('대표 뱃지 설정 실패:', error);
      setActionModal({
        isOpen: true,
        type: 'pin_error',
        resultMessage: '대표 뱃지 설정에 실패했습니다.',
        isSuccessResult: false
      });
    } finally {
      setIsPinning(false);
    }
  };

  const handleActionModalClose = () => {
    setActionModal({
      isOpen: false,
      type: null,
      resultMessage: '',
      isSuccessResult: false
    });
  };

  return (
    <>
    <div 
      className={styles.badgeItem}

      
    >
      <div className={styles.badgeImageContainer}>
        <img 
          src={badge.icon} 
          alt={badge.kor_title}
          className={`${styles.badgeImage} ${!badge.is_awarded ? styles.unawarded : ''}`}
          onClick={handleBadgeClick}
                onMouseEnter={handleBadgeMouseEnter}
      onMouseLeave={handleBadgeMouseLeave}
        />
      </div>
      
      <div className={styles.badgeInfo}>
        <div className={styles.badgeTitle}>{badge.kor_title}</div>
        <div className={styles.badgeSubtitle}>{badge.eng_title}</div>
        {badge.is_awarded && badge.awarded_at && (
          <div className={styles.awardedDate}>
            {formatDate(badge.awarded_at)}
          </div>
        )}

        {/* 대표 뱃지 설정 버튼 */}
        {isMine && badge.is_awarded && (
          isPinnedBadge ? (
            <div className={styles.pinnedText}>
              대표 뱃지입니다
            </div>
          ) : (
            <button 
              className={styles.pinButton}
              onClick={handlePinBadge}
              disabled={isPinning}
            >
              {isPinning ? '설정 중...' : '대표 뱃지로 설정하기'}
            </button>
          )
        )}
      </div>

      {/* 호버 시 설명 툴팁 */}
      {hoveredBadge && (
        <div className={styles.tooltip}>
          <div className={styles.tooltipContent}>
            {badge.description}
          </div>
          <div className={styles.tooltipArrow}></div>
        </div>
      )}
    </div>

    {/* 액션 모달 */}
      {actionModal.isOpen && ReactDOM.createPortal(
        <QuestActionModal
          isOpen={actionModal.isOpen}
          onClose={handleActionModalClose}
          actionType="badge_pin_result"
          questTitle={badge.kor_title}
          resultMessage={actionModal.resultMessage}
          isSuccessResult={actionModal.isSuccessResult}
          showResultDirectly={true}
        />,
        document.body
      )}
      </>
  );
};

export default BadgeItem;