// QuestAdminDetail.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import styles from './QuestAdminDetail.module.css';
import API_ENDPOINTS from '../../utils/constants';
import Pagination from '../common/Pagination/Pagination';

const QuestAdminDetail = ({ questId }) => {
  const [questDetail, setQuestDetail] = useState(null);
  const [questUsers, setQuestUsers] = useState([]);
  const [questBadges, setQuestBadges] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);

  
  const itemsPerPage = 5;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const navigate = useNavigate();

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
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
        const year = String(date.getFullYear()).slice(-2); 
        const month = date.getMonth() + 1; 
        const day = date.getDate();
        return `${year}년 ${month}월 ${day}일`;
      };
      
      return (
        <div className={styles.dateRange}>
          <div>{formatShortDate(start)}</div>
          <div>~{formatShortDate(end)}</div>
        </div>
      );
    } catch (error) {
      return '-';
    }
  };

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  const handleEdit = () => {
    // 수정 모드 진입 또는 수정 페이지로 이동하는 로직
    console.log('Edit quest:', questId);
    // 예: onEdit(questId) 또는 router.push(`/admin/quest/edit/${questId}`)
  };

  const fetchQuestDetail = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_ENDPOINTS.QUEST.ADMIN}/detail/${questId}`);
      setQuestDetail(response.data.questDetail);
    } catch (err) {
      console.error("Failed to fetch quest detail", err);
      setQuestDetail(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestBadges = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_ENDPOINTS.QUEST.ADMIN}/detail/${questId}/badges`);
      setQuestBadges(response.data.questBadges || []);
    } catch (err) {
      console.error("Failed to fetch quest detail", err);
      setQuestBadges([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestUsers = async () => {
    setUsersLoading(true);
    try {
      const params = {
        pageNum: currentPage,
        limit: itemsPerPage
      };

      const response = await axios.get(`${API_ENDPOINTS.QUEST.ADMIN}/detail/${questId}/users`, { params });
      
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

  const handleRowClick = (user) => {
  setSelectedUser(user);
};

const handleCloseUserDetail = () => {
  setSelectedUser(null);
};

const handleCancelUserQuest = async (user) => {
  if (!window.confirm('정말로 이 사용자의 퀘스트 인증을 취소하시겠습니까?')) {
    return;
  }
  
  try {
    const response = await axios.put(
      `${API_ENDPOINTS.QUEST.ADMIN}/quests-certi/${user.quest_user_id}/reject`,
      {
        quest_id: questDetail.quest_id,
        xp: questDetail.xp,  
        user_id: user.user_id
      }
    );
    
    console.log('Cancel quest response:', response.data);
    
    // 성공 시 사용자 목록 새로고침
    fetchQuestUsers();
    setSelectedUser(null);
    alert('퀘스트 인증이 취소되었습니다.');
  } catch (error) {
    console.error('Failed to cancel user quest:', error);
    alert('퀘스트 인증 취소에 실패했습니다.');
  }
};


const truncateText = (text, maxLength = 100) => {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

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

  const onClose = () => {
          window.scrollTo(0, 0);
    navigate('/quest-admin/quest')
  }

  if (loading) {
    return (
      <div className={styles.questAdminDetail}>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  if (!questDetail) {
    return (
      <div className={styles.questAdminDetail}>
        <div className={styles.error}>퀘스트 정보를 불러올 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className={styles.questAdminDetail}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.detailTitle}>Quest Detail</h2>
        <button className={styles.closeButton} onClick={onClose}>
          목록으로 돌아가기
        </button>
      </div>

      {/* Quest Info Section */}
      <div className={styles.questInfo}>
        <div className={styles.infoGrid}>
          {/* Basic Info */}
          <div className={styles.basicInfo}>
            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>ID</label>
              <span className={styles.infoValue}>{questDetail.quest_id}</span>
            </div>
            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>Category</label>
              <span className={styles.infoValue}>{questDetail.category}</span>
            </div>
            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>Title</label>
              <span className={styles.infoValue}>{questDetail.title}</span>
            </div>
            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>Difficulty</label>
              <span className={`${styles.difficultyTag} ${styles[questDetail.difficulty?.toLowerCase()]}`}>
                {questDetail.difficulty}
              </span>
            </div>
            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>XP</label>
              <span className={styles.xpValue}>{questDetail.xp}</span>
            </div>
            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>Seasonal</label>
              <span className={`${styles.seasonalTag} ${questDetail.is_seasonal ? styles.seasonal : styles.permanent}`}>
                {questDetail.is_seasonal ? 'Yes' : 'No'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>Period</label>
              <span className={styles.infoValue}>
                {questDetail.is_seasonal 
                  ? formatDateRange(questDetail.season_start, questDetail.season_end)
                  : '-'
                }
              </span>
            </div>
            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>Status</label>
              <span className={`${styles.statusTag} ${styles[questDetail.status?.toLowerCase()]}`}>
                {questDetail.status}
              </span>
            </div>
            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>Created</label>
              <span className={styles.infoValue}>{formatDate(questDetail.created_at)}</span>
            </div>
          </div>

          {/* Description Section */}
          <div className={styles.descriptionSection}>
            <label className={styles.infoLabel}>Description</label>
            <div className={styles.descriptionContent}>
              {questDetail.description 
                  ? questDetail.description.replace(/✅ 퀘스트 조건:/g, '\n\n✅ 퀘스트 조건:\n')
                      .split('\n').map((line, idx) => (
                        <React.Fragment key={idx}>
                          {line}
                          <br/>
                        </React.Fragment>
                      ))
                  : '-'
                }
            </div>
            
            {/* Badges Section */}
            <div className={styles.badgesSection}>
              <label className={styles.infoLabel}>Badges</label>
              {questBadges.length > 0 ? (
                <div className={styles.badgesGrid}>
                  {questBadges.map((badge) => (
                    <div key={badge.id} className={styles.badgeItem} title={badge.eng_title}>
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

            {/* Action Buttons */}
            <div className={styles.actionButtons}>
              <button className={styles.editButton} onClick={handleEdit}>
                ✏️ 수정하기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className={styles.statsSection}>
        <h3 className={styles.sectionTitle}>Statistics</h3>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{questDetail.count_completed}</div>
            <div className={styles.statLabel}>Completed</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{questDetail.count_in_progress}</div>
            <div className={styles.statLabel}>In Progress</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{questDetail.count_given_up}</div>
            <div className={styles.statLabel}>Given Up</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>
              {questDetail.count_completed + questDetail.count_in_progress + questDetail.count_given_up}
            </div>
            <div className={styles.statLabel}>Total Participants</div>
          </div>
        </div>
      </div>

      {/* Participants Section */}
      <div className={styles.participantsSection}>
        <div className={styles.participantsHeader}>
          <h3 className={styles.sectionTitle}>Participants</h3>
          <span className={styles.participantsCount}>Total {totalCount} participants</span>
        </div>

        {/* Participants Table Header */}
        <div className={styles.tableHeader}>
          <div className={styles.headerCell}>User ID</div>
          <div className={styles.headerCell}>Status</div>
          <div className={styles.headerCell}>Description</div>
          <div className={styles.headerCell}>Started</div>
          <div className={styles.headerCell}>Completed</div>
          <div className={styles.headerCell}>Images</div>
        </div>

        {/* Participants Table Body */}
        <div className={styles.tableBody}>
          {usersLoading ? (
            <div className={styles.usersLoading}>Loading participants...</div>
          ) : questUsers.length === 0 ? (
            <div className={styles.noUsers}>No participants found</div>
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

        {/* Pagination */}
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
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className={styles.userDetailModal} onClick={handleCloseUserDetail}>
          <div className={styles.userDetailContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.userDetailHeader}>
              <h3> 상세 인증 정보</h3>
              <button className={styles.closeModalButton} onClick={handleCloseUserDetail}>
                ✕
              </button>
            </div>
            
            <div className={styles.userDetailBody}>
              <div className={styles.userDetailItem}>
                <label>User ID</label>
                <span>{selectedUser.user_id}</span>
              </div>
              
              <div className={styles.userDetailItem}>
                <label>Status</label>
                <span className={`${styles.userStatusTag} ${styles[selectedUser.status?.toLowerCase()]}`}>
                  {selectedUser.status}
                </span>
              </div>
              
              <div className={styles.userDetailItem}>
                <label>Description</label>
                <div className={styles.fullDescription}>
                  {selectedUser.description || '-'}
                </div>
              </div>
              
              <div className={styles.userDetailItem}>
                <label>Started</label>
                <span>{formatDate(selectedUser.started_at)}</span>
              </div>
              
              <div className={styles.userDetailItem}>
                <label>Completed</label>
                <span>{selectedUser.completed_at ? formatDate(selectedUser.completed_at) : '-'}</span>
              </div>
              
              {selectedUser.images && selectedUser.images.length > 0 && (
                <div className={styles.userDetailItem}>
                  <label>Images ({selectedUser.images.length})</label>
                  <div className={styles.userDetailImages}>
                    {selectedUser.images.map((image, idx) => (
                      <img
                        key={idx}
                        src={image}
                        alt={`User ${selectedUser.user_id} image ${idx + 1}`}
                        className={styles.userDetailImage}
                        onClick={() => window.open(image, '_blank')}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {selectedUser.status=='COMPLETED' &&
              <div className={styles.userDetailActions}>
                <button 
                  className={styles.cancelQuestButton}
                  onClick={() => handleCancelUserQuest(selectedUser)}
                >
                  🚫 퀘스트 인증 취소하기
                </button>
              </div>
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(QuestAdminDetail);