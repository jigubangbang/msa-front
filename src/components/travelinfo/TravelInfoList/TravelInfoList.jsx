import React, { useState, useEffect } from 'react';
import API_ENDPOINTS from '../../../utils/constants';
import Pagination from '../../common/Pagination/Pagination';
import Dropdown from '../../common/Dropdown';
import styles from './TravelInfoList.module.css';
import JoinChatModal from '../../modal/JoinChatModal/JoinChatModal';
import DetailDropdown from '../../common/DetailDropdown/DetailDropdown';
import ReportModal from '../../common/Modal/ReportModal';
import { useChatContext } from '../../../utils/ChatContext';
import api from '../../../apis/api';
import ConfirmModal from '../../common/ErrorModal/ConfirmModal';
import SimpleConfirmModal from '../../common/ErrorModal/SimpleConfirmModal';
import LoginConfirmModal from '../../common/LoginConfirmModal/LoginConfirmModal';
import { useNavigate } from 'react-router-dom';
import CirclesSpinner from '../../common/Spinner/CirclesSpinner';
import heartFilledIcon from '../../../assets/feed/heart_filled.svg';
import heartEmptyIcon from '../../../assets/feed/heart_empty.svg';

const TravelInfoList = ({
  currentUserId,
  searchTerm,
  currentPage,
  setCurrentPage,
  isLogin,
  initialCategories = [] // 부모로부터 받은 초기 카테고리 배열
}) => {
  const [travelinfos, setTravelinfos] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [joinedChats, setJoinedChats] = useState(new Set());
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportInfo, setReportInfo] = useState(null);

  // Alert 모달 상태 (ConfirmModal)
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // 삭제 확인 모달 상태 (SimpleConfirmModal)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmMessage, setDeleteConfirmMessage] = useState('');
  const [deleteConfirmCallback, setDeleteConfirmCallback] = useState(null);

  // 로그인 확인 모달 상태 (LoginConfirmModal)
  const [showLoginConfirm, setShowLoginConfirm] = useState(false);

  // 채팅방 입장
  const { openChat, closeChat, chatRooms } = useChatContext();
  const navigate = useNavigate();
  
  // 내부에서 카테고리와 정렬 관리
  const [selectedCategories, setSelectedCategories] = useState(initialCategories);
  const [sortOption, setSortOption] = useState('latest');

  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // 모달 관련 함수들
  const showAlert = (message) => {
    setAlertMessage(message);
    setShowAlertModal(true);
  };

  const hideAlert = () => {
    setShowAlertModal(false);
    setAlertMessage('');
  };

  const customDeleteConfirm = (message, callback) => {
    setDeleteConfirmMessage(message);
    setDeleteConfirmCallback({ fn: callback });
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmCallback && deleteConfirmCallback.fn) {
      deleteConfirmCallback.fn();
    }
    setShowDeleteConfirm(false);
    setDeleteConfirmCallback(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setDeleteConfirmCallback(null);
  };

  const handleLoginConfirm = () => {
    setShowLoginConfirm(false);
    navigate('/login');
  };

  const handleLoginCancel = () => {
    setShowLoginConfirm(false);
  };

  // 카테고리 정의 (Quest와 동일한 스타일)
  const categories = [
    { id: 0, label: '전체' }, // 전체 버튼 추가
    { id: 1, label: '후기/팁' },
    { id: 2, label: '질문/답변' },
    { id: 3, label: '맛집/음식' },
    { id: 4, label: '항공/교통' },
    { id: 5, label: '한달살기/장기여행' },
    { id: 6, label: '자유주제' },
    { id: 7, label: '아시아' },
    { id: 8, label: '유럽' },
    { id: 9, label: '미주' },
    { id: 10, label: '중동/아프리카' },
    { id: 11, label: '오세아니아' },
    { id: 12, label: '국내' }
  ];

  const sortOptions = [
    { value: 'latest', label: '최신등록순' },
    { value: 'likes', label: '좋아요순' },
    { value: 'chat', label: '활발한순' }
  ];

  const handleSortChange = (option) => {
    setSortOption(option.value);
    setCurrentPage(1);
  };

  const handleCategorySelect = (categoryId) => {
    console.log('선택된 카테고리 ID:', categoryId);
    
    if (categoryId === 0) {
      // 전체 선택시 모든 카테고리 해제
      setSelectedCategories([]);
    } else {
      setSelectedCategories(prev => {
        let updatedCategories;
        
        if (prev.includes(categoryId)) {
          updatedCategories = prev.filter(id => id !== categoryId);
        } else {
          updatedCategories = [...prev, categoryId];
        }
        
        return updatedCategories;
      });
    }
    
    setCurrentPage(1);
  };

  const handleLikeToggle = async (postId, event) => {
    event.stopPropagation();
    if (!isLogin) return;
    
    try {
      const isLiked = likedPosts.has(postId);
      
      if (isLiked) {
        await api.delete(`${API_ENDPOINTS.COMMUNITY.USER}/travelinfo/like/${postId}`, {
        headers: {
          'User-Id': currentUserId,
        },
      });
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      } else {
        await api.post(`${API_ENDPOINTS.COMMUNITY.USER}/travelinfo/like/${postId}`, 
          {},
          {
            headers: {
              'User-Id': currentUserId,
            },
          }
        );
        setLikedPosts(prev => new Set(prev).add(postId));
      }
      
      setTravelinfos(prev => prev.map(info => 
        info.id === postId 
          ? { ...info, likeCount: info.likeCount + (isLiked ? -1 : 1) }
          : info
      ));
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleJoinClick = (travelinfo, event) => {
    event.stopPropagation();
    
    if (!isLogin) {
      setShowLoginConfirm(true);
      return;
    }

    if (joinedChats.has(travelinfo.id)) {
      handleChatClick(travelinfo.id);
    } else {
      setSelectedInfo(travelinfo);
      setIsJoinModalOpen(true);
    }
  };

  //채팅하기 버튼
  const handleChatClick = async (groupId) => {
    try {
      const response = await api.post(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/chat`, {
        groupType: "TRAVELINFO",
        groupId: groupId
      });
      
      const chatRoomId = response.data.chatRoomId;
      console.log('채팅방으로 이동:', chatRoomId);

      if (response.data.success && response.data.chatRoomId) {
        openChat(response.data.chatRoomId, currentUserId, {
          onLeave: () => {
            if (fetchTravelinfos) {
              fetchTravelinfos();
            }
          }
        });
      } else {
        showAlert('채팅방 정보를 가져오는데 실패했습니다.');
      }
      
    } catch (error) {
      console.error('Failed to get chat room:', error);
      showAlert('채팅방을 불러오는데 실패했습니다.');
    }
  };

  const handleJoinSubmit = async () => {
    if (!selectedInfo) return;

    try {
      await api.post(`${API_ENDPOINTS.COMMUNITY.USER}/travelinfo/${selectedInfo.id}/join`, {}, 
      {
        headers: {
          'User-Id': currentUserId,
        },
      });
      
      setJoinedChats(prev => new Set(prev).add(selectedInfo.id));
      
      setTravelinfos(prev => prev.map(info => 
        info.id === selectedInfo.id 
          ? { ...info, memberCount: info.memberCount + 1 }
          : info
      ));

      showAlert('참여가 완료되었습니다!');
      setIsJoinModalOpen(false);
      setSelectedInfo(null);
    } catch (error) {
      console.error('Failed to join chat:', error);
      showAlert('참여에 실패했습니다.');
    }
  };

  const handleJoinModalClose = () => {
    setIsJoinModalOpen(false);
    setSelectedInfo(null);
  };

  // ReportModal 닫기
  const handleReportClose = () => {
    setShowReportModal(false);
    setReportInfo(null);
  };

  const handleReport = (travelinfo) => {
    console.log('신고하기:', travelinfo);
    // 신고 로직 구현
    if (!isLogin) {
      showAlert('로그인이 필요합니다.');
      return;
    }
    setShowReportModal(true);
    setReportInfo(travelinfo);
  };

  const handleReportSubmit = async (reportData) => {
      try {
        const payload = {
          reporterId: currentUserId,
          targetUserId: reportInfo.creatorId,
          contentSubtype: 'TRAVELINFO',
          contentType:'GROUP',
          contentId: reportInfo.id,
          reasonCode: reportData.reasonCode,
          reasonText: reportData.reasonText
        };

        await api.post(
          `${API_ENDPOINTS.COMMUNITY.USER}/report`,
          payload,
          {
            headers: {
              'User-Id': currentUserId, 
            },
          }
        );
        
        setShowReportModal(false);
        setReportInfo(null);
        showAlert('신고가 접수되었습니다.');
        
      } catch (error) {
        console.error('Failed to submit report:', error);
        const errorMessage = error.response?.data?.error || '신고 접수에 실패했습니다.';
        showAlert(errorMessage);
      }
    };

  const handleEdit = (travelinfoId) => {
    console.log('수정하기:', travelinfoId);
    // 수정 페이지로 이동
    window.location.href = `/traveler/info/${travelinfoId}/edit`;
  };

  const handleDelete = async (travelinfoId) => {
    customDeleteConfirm(
      '정말로 이 정보방을 삭제하시겠습니까?',
      async () => {
        try {
          await api.delete(`${API_ENDPOINTS.COMMUNITY.USER}/travelinfo/${travelinfoId}`,
          {
            headers: {
              'User-Id': currentUserId,
            },
          });
          showAlert('정보방이 삭제되었습니다.');
          // 목록 새로고침
          fetchTravelinfos();
        } catch (error) {
          console.error('Failed to delete travelinfo:', error);
          showAlert('삭제에 실패했습니다.');
        }
      }
    );
  };

  // 카테고리, 정렬, 검색어, 페이지 변경시 데이터 fetch
  useEffect(() => {
    fetchTravelinfos();
  }, [currentPage, selectedCategories, sortOption, searchTerm]);

  useEffect(() => {
    if (isLogin) {
      fetchLikedPosts();
      fetchJoinedChats();
    }
  }, [isLogin]);

  const fetchLikedPosts = async () => {
    if (!isLogin) return;
    
    try {
      const response = await api.get(`${API_ENDPOINTS.COMMUNITY.USER}/travelinfo/likes`,
      {
        headers: {
          'User-Id': currentUserId,
        },
      });
      setLikedPosts(new Set(response.data.likedTravelInfoIds));
    } catch (error) {
      console.error('Failed to fetch liked posts:', error);
    }
  };

  const fetchJoinedChats = async () => {
    if (!isLogin) return;
    
    try {
      const response = await api.get(`${API_ENDPOINTS.COMMUNITY.USER}/travelinfo/joined-chats`,
      {
        headers: {
          'User-Id': currentUserId,
        },
      });
      setJoinedChats(new Set(response.data.joinedChatIds));
    } catch (error) {
      console.error('Failed to fetch joined chats:', error);
    }
  };

  const fetchTravelinfos = async () => {
    setLoading(true);
    try {
      let params = {
        pageNum: currentPage,
        sortOption: sortOption,
        ...(searchTerm && { search: searchTerm })
      };

      // 전체가 아닌 경우에만 themes 파라미터 추가
      if (selectedCategories.length > 0) {
        params.themes = selectedCategories.join(',');
      }

      console.log('최종 API 요청 파라미터:', params);

      const response = await api.get(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/travelinfo/list`, {
        params: params
      });

      setTravelinfos(response.data.travelInfos || []);
      setTotalCount(response.data.totalCount || 0);
    } catch (err) {
      console.error("Failed to fetch travelinfos", err);
      setTravelinfos([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNum) => {
    window.scroll(0,0);
    setCurrentPage(pageNum);
  };

  const getSelectedCategoryNames = () => {
  if (selectedCategories.length === 0) return null;
  
  return selectedCategories.map(categoryId => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.label : categoryId;
  });
};

const getSortDisplayText = () => {
  const selected = sortOptions.find(opt => opt.value === sortOption);
  return selected ? selected.label : "정렬 기준";
};

  if (loading) {
    return (
      <div className={styles.travelInfoList}>
        <CirclesSpinner/>
      </div>
    );
  }

  return (
    <div className={styles.travelInfoList}>
      {/* 헤더와 정렬 */}
      <div className={styles.header}>
        <Dropdown
          defaultOption={getSortDisplayText()}
          options={sortOptions}
          onSelect={handleSortChange}
        />
      </div>

      {/* 카테고리 필터 (Quest 스타일) */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <div className={styles.filterButtons}>
            {categories.map((category) => (
              <button
                key={category.id}
                className={`${styles.filterButton} ${
                  category.id === 0 
                    ? (selectedCategories.length === 0 ? styles.active : '')
                    : (selectedCategories.includes(category.id) ? styles.active : '')
                }`}
                onClick={() => handleCategorySelect(category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 검색 결과 정보 */}
    <div className={styles.searchSection}>
      <p className={styles.totalCount}>
        {searchTerm 
          ? `"${searchTerm}"의 검색 결과... ${totalCount}개의 정보 공유방을 찾았습니다.`
          : `현재 ${totalCount}개의 정보 공유방이 있습니다.`
        }
      </p>
      
      {/* 카테고리 선택 결과 표시 */}
      {selectedCategories.length > 0 && (
        <div className={styles.searchConditions}>
          <span className={styles.searchConditionsLabel}>카테고리 선택: </span>
          {getSelectedCategoryNames().map((categoryName, index) => (
            <span key={index} className={styles.searchCondition}>
              {categoryName}
              {index < getSelectedCategoryNames().length - 1 && ', '}
            </span>
          ))}
        </div>
      )}
    </div>

      {/* Table Header */}
      <div className={styles.tableHeader}>
        <div className={styles.headerCell}>썸네일</div>
        <div className={styles.headerCell}>제목</div>
        <div className={styles.headerCell}>작성자</div>
        <div className={styles.headerCell}>멤버</div>
        <div className={styles.headerCell}>최근 메시지</div>
        <div className={styles.headerCell}>좋아요</div>
        <div className={styles.headerCell}>참여</div>
        <div className={styles.headerCell}>ACTION</div>
      </div>

      {/* Table Body */}
      <div className={styles.tableBody}>
        {travelinfos.map((travelinfo, index) => {
          const uniqueKey = travelinfo.id ? `travelinfo-${travelinfo.id}` : `travelinfo-${currentPage}-${index}`;
          const isLiked = likedPosts.has(travelinfo.id);
          const isJoined = joinedChats.has(travelinfo.id);
          const isBlind = travelinfo.blindStatus === 'BLINDED';

          return (
            <div 
              key={uniqueKey} 
              className={styles.tableRow}
            >
              <div className={styles.cell}>
                <div className={styles.thumbnailImage}>
                  <img 
                    src={isBlind ? '/icons/common/warning.png' : (travelinfo.thumbnailImage || '/images/default-thumbnail.jpg')} 
                    alt="썸네일" 
                  />
                </div>
              </div>
              
              <div className={styles.cell}>
                <div className={styles.titleCell}>
                  <div className={styles.title}>
                    {isBlind ? '블라인드 처리된 게시글입니다' : travelinfo.title}
                  </div>
                  <div className={styles.description}>
                    {isBlind ? '' : travelinfo.simpleDescription}
                  </div>
                </div>
              </div>
              
              <div className={styles.cell}>
                <div className={styles.creatorInfo}>
                  <div className={styles.creatorNickname}>
                    {isBlind ? '-' : travelinfo.creatorNickname}
                  </div>
                </div>
              </div>
              
              <div className={styles.cell}>
                <div className={styles.memberCount}>
                  {isBlind ? '-' : `${travelinfo.memberCount || 0}명`}
                </div>
              </div>
              
              <div className={styles.cell}>
                <div className={styles.messageCell}>
                  {isBlind ? '-' : (travelinfo.latestMessage || '대화가 없습니다')}
                </div>
              </div>
              
              <div className={styles.cell}>
                <div className={styles.likeSection}>
                  {isBlind ? (
                    <span>-</span>
                  ) : (
                    <>
                      <button 
                        className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
                        onClick={(e) => handleLikeToggle(travelinfo.id, e)}
                        disabled={!isLogin}
                      >
                        <img src={isLiked ? heartFilledIcon : heartEmptyIcon} alt="좋아요"/>
                      </button>
                      <span className={styles.likeCount}>{travelinfo.likeCount}</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className={styles.cell}>
                {!isBlind && (
                  <button 
                    className={`${styles.joinButton} ${isJoined ? styles.chatButton : ''}`}
                    onClick={(e) => handleJoinClick(travelinfo, e)}
                  >
                    {isJoined ? '채팅하기' : '참여하기'}
                  </button>
                )}
              </div>

              <div className={styles.cell}>
                {!isBlind && (
                  <DetailDropdown
                    isCreator={currentUserId==travelinfo.creatorId}
                    onReport={() => handleReport(travelinfo)}
                    onEdit={() => handleEdit(travelinfo.id)}
                    onDelete={() => handleDelete(travelinfo.id)}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          pageBlock={5}
          pageCount={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* 참여 모달 (JoinChatModal) */}
      <JoinChatModal
        isOpen={isJoinModalOpen}
        onClose={handleJoinModalClose}
        onSubmit={handleJoinSubmit}
        chatTitle={selectedInfo?.title}
        message={selectedInfo?.enterDescription}
      />

      {/* 신고 모달 (ReportModal) */}
      <ReportModal
        show={showReportModal}
        onClose={handleReportClose}
        onSubmit={handleReportSubmit}
      />

      {/* 로그인 확인 모달 (LoginConfirmModal) */}
      <LoginConfirmModal
        isOpen={showLoginConfirm}
        onClose={handleLoginCancel}
        onConfirm={handleLoginConfirm}
      />

      {/* 삭제 확인 모달 (SimpleConfirmModal) */}
      <SimpleConfirmModal
        isOpen={showDeleteConfirm}
        message={deleteConfirmMessage}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Alert 모달 (ConfirmModal) */}
      <ConfirmModal
        isOpen={showAlertModal}
        onClose={hideAlert}
        message={alertMessage}
        type="alert"
      />
    </div>
  );
};

export default React.memo(TravelInfoList);