// BadgeAdminDetail.jsx - 퀘스트 상세와 통일감 있게 리팩토링
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './BadgeAdminDetail.module.css';
import API_ENDPOINTS from '../../utils/constants';
import api from '../../apis/api';
import Modal from '../common/Modal/Modal';
import backIcon from "../../assets/admin/back.svg";
import CirclesSpinner from '../common/Spinner/CirclesSpinner';

const BadgeAdminDetail = ({ badgeId }) => {
  const [badgeDetail, setBadgeDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  // 모달 상태
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  // 삭제 확인 모달 (2단계)
  const [showDeleteFirstModal, setShowDeleteFirstModal] = useState(false);
  const [showDeleteSecondModal, setShowDeleteSecondModal] = useState(false);

  const navigate = useNavigate();

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}.${month}.${day} ${hours}:${minutes}`;
    } catch (error) {
      return dateString;
    }
  };

  // 모달 헬퍼 함수들
  const openConfirmModal = (message, action) => {
    setModalMessage(message);
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  const openSuccessModal = (message) => {
    setModalMessage(message);
    setShowSuccessModal(true);
  };

  const openErrorModal = (message) => {
    setModalMessage(message);
    setShowErrorModal(true);
  };

  const fetchBadgeDetail = async () => {
    setLoading(true);
    try {
      const response = await api.get(`${API_ENDPOINTS.QUEST.ADMIN}/badges/${badgeId}/modify`);
      setBadgeDetail(response.data);
    } catch (err) {
      console.error("Failed to fetch badge detail", err);
      openErrorModal('뱃지 정보를 불러오는데 실패했습니다');
      setBadgeDetail(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/quest-admin/badge/${badgeId}/modify`);
  };

  const handleDelete = () => {
    setShowDeleteFirstModal(true);
  };

  const handleDeleteFirstConfirm = () => {
    setShowDeleteFirstModal(false);
    setShowDeleteSecondModal(true);
  };

  const handleDeleteSecondConfirm = async () => {
    setShowDeleteSecondModal(false);
    
    try {
      await api.delete(`${API_ENDPOINTS.QUEST.ADMIN}/badges/${badgeId}`);
      openSuccessModal('뱃지가 성공적으로 삭제되었습니다!');
      setConfirmAction(() => () => navigate('/quest-admin/badge'));
    } catch (error) {
      console.error('Failed to delete badge:', error);
      
      if (error.response?.data?.error) {
        openErrorModal(`뱃지 삭제에 실패했습니다: ${error.response.data.error}`);
      } else {
        openErrorModal('뱃지 삭제에 실패했습니다');
      }
    }
  };

  const onClose = () => {
    window.scrollTo(0, 0);
    navigate('/quest-admin/badge');
  };

  const handleQuestDetail = (quest) => {
    window.scrollTo(0, 0);
    navigate(`/quest-admin/quest/${quest.quest_id}`);
  };

  const handleUserClick = (user) => {
    window.scrollTo(0, 0);
    navigate(`/my-quest/profile/${user.user_id}`);
  };

  useEffect(() => {
    if (badgeId) {
      fetchBadgeDetail();
    }
  }, [badgeId]);

  if (loading) {
    return <CirclesSpinner />;
  }

  if (!badgeDetail) {
    return (
      <div className={styles.badgeAdminDetail}>
        <div className={styles.emptyContainer}>
          <p className={styles.emptyText}>뱃지 정보를 불러올 수 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.badgeAdminDetail}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onClose}>
          <img src={backIcon} alt="뒤로가기" className={styles.backIcon} />
        </button>
        <h2 className={styles.sectionTitle}>뱃지 상세</h2>
      </div>

      {/* 1. 기본 정보 & 설명 섹션 (좌우 배치) */}
      <div className={styles.infoGrid}>
        {/* 왼쪽: 기본 정보 */}
        <div className={styles.basicInfoSection}>
          <div className={styles.basicInfoCard}>
            <div className={styles.cardItem}>
              <label>뱃지 ID :</label>
              <span>{badgeDetail.id}</span>
            </div>
            <div className={styles.cardItem}>
              <label>뱃지명(국문) :</label>
              <span>{badgeDetail.kor_title}</span>
            </div>
            <div className={styles.cardItem}>
              <label>뱃지명(영문) :</label>
              <span>{badgeDetail.eng_title}</span>
            </div>
            <div className={styles.cardItem}>
              <label>난이도 :</label>
              <span className={`${styles.difficultyTag} ${styles[`difficulty${badgeDetail.difficulty}`]}`}>
                Level {badgeDetail.difficulty}
              </span>
            </div>
            <div className={styles.cardItem}>
              <label>획득한 사용자 수 :</label>
              <span className={styles.awardedValue}>{badgeDetail.count_awarded}명</span>
            </div>
            <div className={styles.cardItem}>
              <label>생성일 :</label>
              <span>{formatDate(badgeDetail.created_at)}</span>
            </div>
          </div>
        </div>

        {/* 오른쪽: 아이콘 & 설명 */}
        <div className={styles.descriptionSection}>
          {/* 뱃지 아이콘 */}
          <div className={styles.badgeIconContainer}>
            <label className={styles.infoLabel}>뱃지 아이콘</label>
            <div className={styles.badgeIconSection}>
              <img 
                src={badgeDetail.icon} 
                alt={badgeDetail.kor_title}
                className={styles.badgeIconLarge}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>

          {/* 설명 */}
          <div className={styles.descriptionContainer}>
            <label className={styles.infoLabel}>뱃지 설명</label>
            <div className={styles.descriptionContent}>
              {badgeDetail.description || '설명이 없습니다'}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className={styles.actionButtons}>
            <button className={styles.editButton} onClick={handleEdit}>
              수정
            </button>
            <button className={styles.deleteButton} onClick={handleDelete}>
              삭제
            </button>
          </div>
        </div>
      </div>

      {/* 2. 필수 퀘스트 섹션 */}
      <div className={styles.formSection}>
        <h3 className={styles.formSectionTitle}>| 연결된 퀘스트 |</h3>
        <div className={styles.questsGrid}>
          {badgeDetail.quest_list && badgeDetail.quest_list.length > 0 ? (
            badgeDetail.quest_list.map((quest) => (
              <div key={quest.quest_id} className={styles.questCard} onClick={() => handleQuestDetail(quest)}>
                <div className={styles.questId}>#{quest.quest_id}</div>
                <div className={styles.questTitle}>{quest.title}</div>
                <div className={styles.questStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>완료</span>
                    <span className={styles.statValue1}>{quest.count_completed}명</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>진행 중</span>
                    <span className={styles.statValue2}>{quest.count_in_progress}명</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noQuests}>연결된 퀘스트가 없습니다</div>
          )}
        </div>
      </div>

      {/* 3. 획득 사용자 섹션 */}
      <div className={styles.usersContainer}>
        <div className={styles.usersHeader}>
          <h3 className={styles.formSectionTitle}>| 획득한 사용자 |</h3>
          <span className={styles.usersCount}>전체 {badgeDetail.count_awarded}명 획득</span>
        </div>

        <div className={styles.usersGrid}>
          {badgeDetail.awarded_user && badgeDetail.awarded_user.length > 0 ? (
            badgeDetail.awarded_user.map((user, index) => (
              <div key={`${user.user_id}-${index}`} className={styles.userCard} 
                onClick={() => handleUserClick(user)}>
                <div className={styles.userProfile}>
                  <img 
                    src={user.profile_image || '/icons/common/default_profile.png'} 
                    alt={user.nickname}
                    className={styles.userAvatar}
                  />
                  <div className={styles.userInfo}>
                    <div className={styles.userNickname}>{user.nickname}</div>
                    <div className={styles.userId}>{user.user_id}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noUsers}>아직 이 뱃지를 획득한 사용자가 없습니다</div>
          )}
        </div>
      </div>

      {/* 삭제 확인 모달 (1단계) */}
      <Modal
        show={showDeleteFirstModal}
        onClose={() => setShowDeleteFirstModal(false)}
        onSubmit={handleDeleteFirstConfirm}
        heading="뱃지 삭제 확인"
        firstLabel="확인"
        secondLabel="취소"
      >
        정말 "{badgeDetail.kor_title}" 뱃지를 삭제하시겠습니까?
      </Modal>

      {/* 삭제 확인 모달 (2단계) */}
      <Modal
        show={showDeleteSecondModal}
        onClose={() => setShowDeleteSecondModal(false)}
        onSubmit={handleDeleteSecondConfirm}
        heading="뱃지 삭제 최종 확인"
        firstLabel="삭제"
        secondLabel="취소"
      >
        <div>
          뱃지 삭제 시 모든 사용자 및 퀘스트와의 연결이 해제됩니다.<br/>
          또한, 삭제 후 복구가 불가합니다. 정말 삭제하시겠습니까?
        </div>
      </Modal>

      {/* 일반 확인 모달 */}
      <Modal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onSubmit={() => {
          setShowConfirmModal(false);
          if (confirmAction) confirmAction();
        }}
        heading="확인"
        firstLabel="확인"
        secondLabel="취소"
      >
        {modalMessage}
      </Modal>

      {/* 성공 모달 */}
      <Modal
        show={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          if (confirmAction) {
            confirmAction();
            setConfirmAction(null);
          }
        }}
        onSubmit={() => {
          setShowSuccessModal(false);
          if (confirmAction) {
            confirmAction();
            setConfirmAction(null);
          }
        }}
        heading="뱃지 삭제 완료"
        firstLabel="확인"
      >
        {modalMessage}
      </Modal>

      {/* 에러 모달 */}
      <Modal
        show={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        onSubmit={() => setShowErrorModal(false)}
        heading="뱃지 삭제 실패"
        firstLabel="확인"
      >
        <div style={{ whiteSpace: 'pre-line' }}>{modalMessage}</div>
      </Modal>
    </div>
  );
};

export default React.memo(BadgeAdminDetail);