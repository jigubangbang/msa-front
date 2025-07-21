// QuestAdminDetail.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './QuestAdminDetail.module.css';
import API_ENDPOINTS from '../../utils/constants';
import Pagination from '../common/Pagination/Pagination';
import api from '../../apis/api';
import Modal from '../common/Modal/Modal';
import backIcon from "../../assets/admin/back.svg";
import closeIcon from "../../assets/common/close.svg";
import CirclesSpinner from '../common/Spinner/CirclesSpinner';
import { Circles } from 'react-loader-spinner';

const QuestAdminDetail = ({ questId }) => {
  const [questDetail, setQuestDetail] = useState(null);
  const [questUsers, setQuestUsers] = useState([]);
  const [questBadges, setQuestBadges] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);

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
  const itemsPerPage = 5;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

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

  // 날짜 포맷팅
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

  const formatDateRange = (startDate, endDate) => {
    try {
      if (!startDate || !endDate) return '-';
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const formatShortDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
      };
      
      return (
        <div className={styles.dateRange}>
          <div>{formatShortDate(start)} ~ {formatShortDate(end)}</div>
        </div>
      );
    } catch (error) {
      return '-';
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // API 호출 함수들
  const fetchQuestDetail = async () => {
    setLoading(true);
    try {
      const response = await api.get(`${API_ENDPOINTS.QUEST.ADMIN}/detail/${questId}`);
      setQuestDetail(response.data.questDetail);
    } catch (err) {
      console.error("Failed to fetch quest detail", err);
      openErrorModal('퀘스트 정보를 불러오는데 실패했습니다');
      setQuestDetail(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestBadges = async () => {
    try {
      const response = await api.get(`${API_ENDPOINTS.QUEST.ADMIN}/detail/${questId}/badges`);
      setQuestBadges(response.data.questBadges || []);
    } catch (err) {
      console.error("Failed to fetch quest badges", err);
      setQuestBadges([]);
    }
  };

  const fetchQuestUsers = async () => {
    setUsersLoading(true);
    try {
      const params = {
        pageNum: currentPage,
        limit: itemsPerPage
      };

      const response = await api.get(`${API_ENDPOINTS.QUEST.ADMIN}/detail/${questId}/users`, { params });
      
      setQuestUsers(response.data.questUsers || []);
      setTotalCount(response.data.totalCount || 0);
    } catch (err) {
      console.error("Failed to fetch quest users", err);
      setQuestUsers([]);
      setTotalCount(0);
    } finally {
      setUsersLoading(false);
    }
  };

  // 이벤트 핸들러들
  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  const handleEdit = () => {
    navigate(`/quest-admin/quest/${questId}/modify`);
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
      await api.delete(`${API_ENDPOINTS.QUEST.ADMIN}/quests/${questId}`);
      openSuccessModal('퀘스트가 성공적으로 삭제되었습니다!');
      setConfirmAction(() => () => navigate('/quest-admin/quest'));
    } catch (error) {
      console.error('Failed to delete quest:', error);
      
      if (error.response?.data?.error) {
        openErrorModal(`퀘스트 삭제에 실패했습니다: ${error.response.data.error}`);
      } else {
        openErrorModal('퀘스트 삭제에 실패했습니다.');
      }
    }
  };

  const handleRowClick = (user) => {
    setSelectedUser(user);
  };

  const handleCloseUserDetail = () => {
    setSelectedUser(null);
  };

  const handleCancelUserQuest = (user) => {
    openConfirmModal(
      '정말 사용자의 퀘스트 인증을 취소하시겠습니까?',
      async () => {
        try {
          await api.put(
            `${API_ENDPOINTS.QUEST.ADMIN}/quests-certi/${user.quest_user_id}/reject`,
            {
              quest_id: questDetail.quest_id,
              xp: questDetail.xp,  
              user_id: user.user_id
            }
          );
          
          fetchQuestUsers();
          setSelectedUser(null);
          setModalMessage('퀘스트 인증이 취소되었습니다');
          setShowSuccessModal(true);
        } catch (error) {
          console.error('Failed to cancel user quest:', error);
          openErrorModal('퀘스트 인증 취소에 실패했습니다');
        }
      }
    );
  };

  const onClose = () => {
    window.scrollTo(0, 0);
    navigate('/quest-admin/quest');
  };

  const handleBadgeClick = (badgeId) => {
    window.scrollTo(0, 0);
    navigate(`/quest-admin/badge/${badgeId}`);
  };

  // useEffect들
  useEffect(() => {
    if (questId) {
      fetchQuestDetail();
      fetchQuestBadges();
    }
  }, [questId]);

  useEffect(() => {
    if (questId) {
      fetchQuestUsers();
    }
  }, [questId, currentPage]);

  if (loading) {
    return <CirclesSpinner />;
  }

  if (!questDetail) {
    return (
      <div className={styles.questAdminDetail}>
        <div className={styles.emptyContainer}>
          <p className={styles.emptyText}>퀘스트 정보를 불러올 수 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.questAdminDetail}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onClose}>
          <img src={backIcon} alt="뒤로가기" className={styles.backIcon} />
        </button>
        <h2 className={styles.sectionTitle}>퀘스트 상세</h2>
      </div>

      {/* 1. 기본 정보 & 설명 섹션 (좌우 배치) */}       
      <div className={styles.infoGrid}>
        {/* 왼쪽: 기본 정보 */}
        <div className={styles.basicInfoSection}>
          <div className={styles.basicInfoCard}>
            <div className={styles.cardItem}>
              <label>퀘스트 ID :</label>
              <span>{questDetail.quest_id}</span>
            </div>
            <div className={styles.cardItem}>
              <label>카테고리 :</label>
              <span>{questDetail.category}</span>
            </div>
            <div className={styles.cardItem}>
              <label>퀘스트명 :</label>
              <span>{questDetail.title}</span>
            </div>
            <div className={styles.cardItem}>
              <label>난이도 :</label>
              <span className={`${styles.difficultyTag} ${styles[questDetail.difficulty?.toLowerCase()]}`}>
                {questDetail.difficulty}
              </span>
            </div>
            <div className={styles.cardItem}>
              <label>XP :</label>
              <span className={styles.xpValue}>{questDetail.xp}</span>
            </div>
            <div className={styles.cardItem}>
              <label>시즌 퀘스트 :</label>
              <span className={`${questDetail.is_seasonal ? styles.seasonal : styles.permanent}`}>
                {questDetail.is_seasonal ? 'O' : '-'}
              </span>
            </div>
            <div className={styles.cardItem}>
              <label>기간 :</label>
              <span>
                {questDetail.is_seasonal 
                  ? formatDateRange(questDetail.season_start, questDetail.season_end)
                  : '-'
                }
              </span>
            </div>
            <div className={styles.cardItem}>
              <label>상태 :</label>
              <span className={`${styles.statusTag} ${styles[questDetail.status?.toLowerCase()]}`}>
                {questDetail.status}
              </span>
            </div>
            <div className={styles.cardItem}>
              <label>생성일 :</label>
              <span>{formatDate(questDetail.created_at)}</span>
            </div>
          </div>
        </div>

        {/* 오른쪽: 설명 & 뱃지 */}
        <div className={styles.descriptionSection}>
          {/* 설명 */}
          <div className={styles.descriptionContainer}>
            <label className={styles.infoLabel}>퀘스트 설명</label>
            <div className={styles.descriptionContent}>
              {questDetail.description 
                ? questDetail.description
                    .split('✅ 퀘스트 조건:')[0]  // 조건 부분 전까지만
                    .split('\n').map((line, idx) => (
                      <React.Fragment key={idx}>
                        {line}
                        <br/>
                      </React.Fragment>
                    ))
                : '-'
              }
            </div>

            {/* 퀘스트 조건 */}
            <div className={styles.conditionsContainer}>
              <label className={styles.infoLabel}>퀘스트 조건</label>
              <div className={styles.conditionsContent}>
                {questDetail.description && questDetail.description.includes('✅ 퀘스트 조건:')
                    ? questDetail.description
                        .split('✅ 퀘스트 조건:')[1]  // 조건 부분만
                        ?.split('\n').map((line, idx) => (
                          <React.Fragment key={idx}>
                            {line}
                            <br/>
                          </React.Fragment>
                        ))
                    : '조건이 설정되지 않았습니다'
                  }
              </div>
            </div>
          </div>

          {/* 뱃지 */}
          <div className={styles.badgesContainer}>
            <label className={styles.infoLabel}>연결된 뱃지</label>
            {questBadges.length > 0 ? (
              <div className={styles.badgesGrid}>
                {questBadges.map((badge) => (
                  <div key={badge.id} className={styles.badgeItem} title={badge.eng_title}
                  onClick={() => handleBadgeClick(badge.badge_id)}>
                    <img 
                      src={badge.icon} 
                      alt={badge.kor_title}
                      className={styles.badgeIcon}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <p className={styles.badgeTitle}>No.{badge.badge_id}</p>
                    <p className={styles.badgeTitle}>{badge.kor_title}</p>
                    <p className={styles.badgeSubTitle}> {badge.eng_title}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noBadges}>배지가 설정되지 않았습니다</div>
            )}
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

      {/* 2. 통계 섹션 */}
      <div className={styles.formSection}>
        <h3 className={styles.formSectionTitle}>| 통계 |</h3>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>
              <div className={styles.statLabel}>전체 참여자</div>
              {questDetail.count_completed + questDetail.count_in_progress + questDetail.count_given_up}명
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>완료</div>
            <div className={styles.statValue1}>{questDetail.count_completed}명</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>진행 중</div>
            <div className={styles.statValue2}>{questDetail.count_in_progress}명</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>포기</div>
            <div className={styles.statValue3}>{questDetail.count_given_up}명</div>
          </div>
        </div>
      </div>

      {/* 3. 참여자 목록 섹션 */}
      <div className={styles.participantsContainer}>
        <div className={styles.participantsHeader}>
          <h3 className={styles.formSectionTitle}>| 참여자 목록 |</h3>
          <span className={styles.participantsCount}>전체 {totalCount}명 참여자</span>
        </div>

        {/* 참여자 테이블 헤더 */}
        <div className={styles.tableHeader}>
          <div className={styles.headerCell}>사용자 ID</div>
          <div className={styles.headerCell}>진행 상태</div>
          <div className={styles.headerCell}>설명</div>
          <div className={styles.headerCell}>시작일시</div>
          <div className={styles.headerCell}>종료일시</div>
          <div className={styles.headerCell}>인증 사진</div>
        </div>

        {/* 참여자 테이블 바디 */}
        <div className={styles.tableBody}>
          {usersLoading ? (
            <div className={styles.usersLoading}>
              <Circles
                height="50"
                width="50"
                color="#000"
                ariaLabel="circles-loading"
                visible={true}
              />
            </div>
          ) : questUsers.length === 0 ? (
            <div className={styles.noUsers}>참여자 정보가 없습니다</div>
          ) : (
            questUsers.map((user, index) => {
              const uniqueKey = user.quest_user_id ? `user-${user.quest_user_id}` : `user-${currentPage}-${index}`;
              
              return (
                <div 
                    key={uniqueKey} 
                    className={`${styles.tableRow} ${selectedUser?.user_id === user.user_id ? styles.selectedRow : ''}`}
                    onClick={() => handleRowClick(user)}
                  >
                  <div className={styles.cell}>{user.user_id}</div>
                  <div className={styles.cell}>
                    <span className={`${styles.userStatusTag} ${styles[user.status?.toLowerCase()]}`}>
                      {user.status}
                    </span>
                  </div>
                  <div className={styles.descriptionCell}>
                    {truncateText(user.description, 100)} 
                  </div>
                  <div className={styles.cell}>{formatDate(user.started_at)}</div>
                  <div className={styles.cell}>
                    {user.completed_at ? formatDate(user.completed_at) : '-'}
                  </div>
                  <div className={styles.cell}>
                    <div className={styles.imagesContainer}>
                      {user.images && user.images.length > 0 ? (
                        <>
                          <div className={styles.imagePreview}>
                            {user.images.slice(0, 3).map((image, idx) => (
                              <img
                                key={idx}
                                src={image}
                                alt={`User ${user.user_id} image ${idx + 1}`}
                                className={styles.thumbnailImage}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(image, '_blank');
                                }}
                              />
                            ))}
                            {user.images.length > 3 && (
                              <span className={styles.moreImages}>+{user.images.length - 3}</span>
                            )}
                          </div>
                        </>
                      ) : (
                        <span className={styles.noImages}>No images</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className={styles.paginationContainer}>
          <Pagination
            currentPage={currentPage}
            pageBlock={5}
            pageCount={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div className={styles.userDetailModal} onClick={handleCloseUserDetail}>
          <div className={styles.userDetailContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.userDetailHeader}>
              <h3>상세 인증 정보</h3>
              <button className={styles.closeModalButton} onClick={handleCloseUserDetail}>
                <img src={closeIcon} alt="닫기" className={styles.closeIcon} />
              </button>
            </div>
            
            <div className={styles.userDetailBody}>
              {/* 기본 정보 카드 */}
              <div className={styles.userInfoCard}>
                <div className={styles.userCardItem}>
                  <label>사용자 ID :</label>
                  <span>{selectedUser.user_id}</span>
                </div>
                <div className={styles.userCardItem}>
                  <label>진행 상태 :</label>
                  <span className={`${styles.userStatusTag} ${styles[selectedUser.status?.toLowerCase()]}`}>
                    {selectedUser.status}
                  </span>
                </div>
                <div className={styles.userCardItem}>
                  <label>시작일시 :</label>
                  <span>{formatDate(selectedUser.started_at)}</span>
                </div>
                <div className={styles.userCardItem}>
                  <label>종료일시 :</label>
                  <span>{selectedUser.completed_at ? formatDate(selectedUser.completed_at) : '-'}</span>
                </div>
              </div>

              {/* 설명 섹션 */}
              <div className={styles.userDescriptionSection}>
                <label className={styles.userSectionLabel}>인증 설명</label>
                <div className={styles.userDescriptionContent}>
                  {selectedUser.description || '설명이 없습니다'}
                </div>
              </div>

              {/* 이미지 섹션 */}
              {selectedUser.images && selectedUser.images.length > 0 && (
                <div className={styles.userImagesSection}>
                  <label className={styles.userSectionLabel}>인증 사진 ({selectedUser.images.length}장)</label>
                  <div className={styles.userImagesGrid}>
                    {selectedUser.images.map((image, idx) => (
                      <img
                        key={idx}
                        src={image}
                        alt={`User ${selectedUser.user_id} image ${idx + 1}`}
                        className={styles.userModalImage}
                        onClick={() => window.open(image, '_blank')}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {selectedUser.status === 'COMPLETED' && (
              <div className={styles.userDetailActions}>
                <button 
                  className={styles.cancelQuestButton}
                  onClick={() => handleCancelUserQuest(selectedUser)}
                >
                  퀘스트 인증 취소
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 (1단계) */}
      <Modal
        show={showDeleteFirstModal}
        onClose={() => setShowDeleteFirstModal(false)}
        onSubmit={handleDeleteFirstConfirm}
        heading="퀘스트 삭제 확인"
        firstLabel="확인"
        secondLabel="취소"
      >
        정말 "{questDetail.title}" 퀘스트를 삭제하시겠습니까?
      </Modal>

      {/* 삭제 확인 모달 (2단계) */}
      <Modal
        show={showDeleteSecondModal}
        onClose={() => setShowDeleteSecondModal(false)}
        onSubmit={handleDeleteSecondConfirm}
        heading="퀘스트 삭제 최종 확인"
        firstLabel="삭제"
        secondLabel="취소"
      >
        <div>
          퀘스트 삭제 시 모든 사용자 및 뱃지와의 연결이 해제됩니다.<br/>
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
        heading="인증 취소 확인"
        firstLabel="확인"
        secondLabel="취소"
      >
        {modalMessage}
      </Modal>

      {/* 성공 모달 */}
      <Modal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)} 
        onSubmit={() => setShowSuccessModal(false)}  
        heading="인증 취소 완료"
        firstLabel="확인"
      >
        {modalMessage}
      </Modal>

      {/* 에러 모달 */}
      <Modal
        show={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        onSubmit={() => setShowErrorModal(false)}
        heading="인증 취소 실패"
        firstLabel="확인"
      >
        <div style={{ whiteSpace: 'pre-line' }}>{modalMessage}</div>
      </Modal>
    </div>
  );
};

export default React.memo(QuestAdminDetail);