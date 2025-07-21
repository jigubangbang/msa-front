import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../../apis/api';
import API_ENDPOINTS from '../../../utils/constants';
import DetailDropdown from '../../common/DetailDropdown/DetailDropdown';
import ReportModal from '../../common/Modal/ReportModal';
import styles from './BoardDetail.module.css';
import ConfirmModal from '../../common/ErrorModal/ConfirmModal';
import CirclesSpinner from '../../common/Spinner/CirclesSpinner';

const BoardDetail = ({ isLogin, currentUserId }) => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  
  // 상호작용 상태
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  
  // 댓글 관련 상태 (TravelmateQA와 동일)
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTexts, setReplyTexts] = useState({});
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  
  // 모달 상태
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  
  // ConfirmModal 관련 상태
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmType, setConfirmType] = useState('alert'); // 'alert' | 'confirm'
  const [confirmAction, setConfirmAction] = useState(null);

  // 블라인드 상태 확인
  const isBlinded = post?.blindStatus === 'BLINDED';
  const isCreator = post?.userId === currentUserId;

  useEffect(() => {
    if (postId) {
      fetchPost();
      fetchComments();
      if (isLogin && currentUserId) {
        fetchInteractionStatus();
        fetchUserProfile();
      }
    }
  }, [postId, isLogin, currentUserId]);

  // ConfirmModal 관련 유틸리티 함수
  const showAlert = (message) => {
    setConfirmMessage(message);
    setConfirmType('alert');
    setConfirmAction(null);
    setShowConfirmModal(true);
  };

  const showConfirm = (message, action) => {
    setConfirmMessage(message);
    setConfirmType('confirm');
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  const hideConfirm = () => {
    setShowConfirmModal(false);
    setConfirmMessage('');
    setConfirmAction(null);
  };

  const handleConfirmAction = () => {
    if (confirmAction) {
      confirmAction();
    }
    hideConfirm();
  };

  const fetchPost = async () => {
    setLoading(true);
    try {
      const response = await api.get(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/board/${postId}`);
      
      console.log('API Response:', response.data);
      
      let postData;
      if (response.data && response.data.success && response.data.data) {
        postData = response.data.data;
      } else if (response.data) {
        postData = response.data;
      } else {
        console.error('Invalid response structure:', response.data);
        return;
      }

      // 이미지 정보 별도 조회 (블라인드되지 않은 경우에만)
      let images = [];
      if (postData.blindStatus !== 'BLINDED') {
        try {
          const imageResponse = await api.get(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/board/${postId}/images`);
          images = imageResponse.data || [];
          console.log('Images:', images);
        } catch (imageError) {
          console.error('Failed to fetch images:', imageError);
          images = [];
        }
      }

      // 이미지 정보를 postData에 추가
      postData.images = images;

      setPost(postData);
      setLikeCount(postData.likeCount || 0);
      setBookmarkCount(postData.bookmarkCount || 0);
      
      if (postData.userId && postData.blindStatus !== 'BLINDED') {
        fetchCreatorProfile(postData.userId);
      }

    } catch (error) {
      console.error('Failed to fetch post:', error);
      console.error('Error response:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchCreatorProfile = async (userId) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/user-profile/${userId}`);
      setCreatorProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch creator profile:', error);
    }
  };

  const fetchUserProfile = async () => {
    if (!currentUserId) return;
    try {
      const response = await api.get(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/user-profile/${currentUserId}`);
      setUserProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.get(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/board/${postId}/comments`);
      
      // TravelmateQA와 동일한 형태로 변환
      const transformedComments = response.data.map(comment => ({
        id: comment.id,
        userId: comment.userId,
        nickname: comment.nickname,
        profileImage: comment.profileImage,
        question: comment.content, // content를 question으로 매핑
        createdAt: comment.createdAt,
        blindStatus: comment.blindStatus,
        isDeleted: comment.isDeleted,
        replies: comment.replies ? comment.replies.map(reply => ({
          id: reply.id,
          userId: reply.userId,
          nickname: reply.nickname,
          profileImage: reply.profileImage,
          answer: reply.content, // content를 answer로 매핑
          createdAt: reply.createdAt,
          blindStatus: reply.blindStatus,
          isDeleted: reply.isDeleted
        })) : []
      }));
      
      setComments(transformedComments);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setComments([]);
    }
  };

  const fetchInteractionStatus = async () => {
    // 블라인드된 게시글은 상호작용 정보를 가져오지 않음
    if (isBlinded) return;
    
    try {
      const [likeResponse, bookmarkResponse] = await Promise.all([
        api.get(`${API_ENDPOINTS.COMMUNITY.USER}/board/like/${postId}/status`, {
          headers: { 'User-Id': currentUserId }
        }),
        api.get(`${API_ENDPOINTS.COMMUNITY.USER}/board/bookmark/${postId}/status`, {
          headers: { 'User-Id': currentUserId }
        })
      ]);
      
      setIsLiked(likeResponse.data.isLiked);
      setIsBookmarked(bookmarkResponse.data.isBookmarked);
    } catch (error) {
      console.error('Failed to fetch interaction status:', error);
    }
  };

  // TravelmateQA와 동일한 댓글 관련 함수들
  const handleCommentSubmit = async () => {
    if (!isLogin || !newComment.trim() || isBlinded) return;

    try {
      await api.post(
        `${API_ENDPOINTS.COMMUNITY.USER}/board/${postId}/comments`,
        { content: newComment },
        {
          headers: {
            'User-Id': currentUserId,
          },
        }
      );
      
      setNewComment('');
      fetchComments(); 
      showAlert('댓글이 등록되었습니다.');
    } catch (error) {
      console.error('Failed to submit comment:', error);
      const errorMessage = error.response?.data?.error || '댓글 등록에 실패했습니다.';
      showAlert(errorMessage);
    }
  };

  const handleReplySubmit = async (commentId) => {
    const replyText = replyTexts[commentId];
    if (!isLogin || !replyText?.trim() || isBlinded) return;

    try {
      await api.post(
        `${API_ENDPOINTS.COMMUNITY.USER}/board/${postId}/comments/${commentId}/replies`,
        { content: replyText },
        {
          headers: {
            'User-Id': currentUserId,
          },
        }
      );
            
      setReplyTexts(prev => ({ ...prev, [commentId]: '' }));
      setActiveReplyId(null);
      fetchComments(); 
      showAlert('답변이 등록되었습니다.');
    } catch (error) {
      console.error('Failed to submit reply:', error);
      const errorMessage = error.response?.data?.error || '답변 등록에 실패했습니다.';
      showAlert(errorMessage);
    }
  };

  const handleReplyClick = (commentId) => {
    if (isBlinded) return; // 블라인드된 게시글에서는 댓글 작성 불가
    setActiveReplyId(activeReplyId === commentId ? null : commentId);
  };

  const handleDropdownAction = (type, itemId, currentContent) => {
    switch(type) {
      case 'edit':
        handleEdit(itemId, currentContent);
        break;
      case 'delete':
        handleDelete(itemId);
        break;
    }
  };

  const handleEdit = (commentId, currentContent) => {
    setEditingId(commentId);
    setEditingText(currentContent);
  };

  const handleEditSubmit = async (commentId) => {
    if (!editingText.trim()) return;
    
    try {
      await api.put(
        `${API_ENDPOINTS.COMMUNITY.USER}/board/${postId}/comments/${commentId}`,
        { content: editingText.trim() },
        {
          headers: {
            'User-Id': currentUserId,
          },
        }
      );
      
      setEditingId(null);
      setEditingText('');
      fetchComments();
      showAlert('댓글이 수정되었습니다.');
    } catch (error) {
      console.error('Failed to update comment:', error);
      const errorMessage = error.response?.data?.error || '댓글 수정에 실패했습니다.';
      showAlert(errorMessage);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingText('');
  };

  const handleDelete = async (commentId) => {
    const deleteComment = async () => {
      try {
        await api.delete(`${API_ENDPOINTS.COMMUNITY.USER}/board/${postId}/comments/${commentId}`, {
          headers: {
            'User-Id': currentUserId,
          },
        });
        
        fetchComments();
        showAlert('댓글이 삭제되었습니다.');
      } catch (error) {
        console.error('Failed to delete comment:', error);
        const errorMessage = error.response?.data?.error || '댓글 삭제에 실패했습니다.';
        showAlert(errorMessage);
      }
    };

    showConfirm('정말로 댓글을 삭제하시겠습니까?', deleteComment);
  };

  const handleReport = (id, userId) => {
    if (!isLogin) {
      showAlert('로그인이 필요합니다.');
      return;
    }
    if (userId == currentUserId ){
      showAlert('자기 자신을 신고할 수 없습니다');
      return;
    }
    setReportTarget({ id, userId });
    setShowReportModal(true);
  };

  const handleReportSubmit = async (reportData) => {
    try {
      const payload = {
        reporterId: currentUserId,
        targetUserId: reportTarget.userId,
        contentSubtype: 'COMMUNITY',
        contentType: reportTarget.type || 'COMMENT',
        contentId: reportTarget.id,
        reasonCode: reportData.reasonCode,
        reasonText: reportData.reasonText
      };

      await api.post(`${API_ENDPOINTS.COMMUNITY.USER}/report`, payload, {
        headers: { 'User-Id': currentUserId }
      });
      
      setShowReportModal(false);
      setReportTarget(null);
      showAlert('신고가 접수되었습니다.');
    } catch (error) {
      console.error('Failed to submit report:', error);
      showAlert('신고 접수에 실패했습니다.');
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMonths = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 30));
    
    if (diffInMonths === 0) {
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      if (diffInDays === 0) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
      }
      return `${diffInDays}일전`;
    }
    return `${diffInMonths}월전`;
  };

  // 기존 함수들 (좋아요, 북마크, 이미지 모달 등)
  const handleLikeToggle = async () => {
    if (!isLogin || isBlinded) {
      if (isBlinded) {
        showAlert('블라인드 처리된 게시글입니다.');
      } else {
        showAlert('로그인이 필요한 서비스입니다.');
      }
      return;
    }

    try {
      if (isLiked) {
        await api.delete(`${API_ENDPOINTS.COMMUNITY.USER}/board/like/${postId}`, {
          headers: { 'User-Id': currentUserId }
        });
        setLikeCount(prev => prev - 1);
        setIsLiked(false);
      } else {
        await api.post(`${API_ENDPOINTS.COMMUNITY.USER}/board/like/${postId}`, {}, {
          headers: { 'User-Id': currentUserId }
        });
        setLikeCount(prev => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      showAlert('좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  const handleBookmarkToggle = async () => {
    if (!isLogin || isBlinded) {
      if (isBlinded) {
        showAlert('블라인드 처리된 게시글입니다.');
      } else {
        showAlert('로그인이 필요한 서비스입니다.');
      }
      return;
    }

    try {
      if (isBookmarked) {
        await api.delete(`${API_ENDPOINTS.COMMUNITY.USER}/board/bookmark/${postId}`, {
          headers: { 'User-Id': currentUserId }
        });
        setBookmarkCount(prev => prev - 1);
        setIsBookmarked(false);
      } else {
        await api.post(`${API_ENDPOINTS.COMMUNITY.USER}/board/bookmark/${postId}`, {}, {
          headers: { 'User-Id': currentUserId }
        });
        setBookmarkCount(prev => prev + 1);
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      showAlert('북마크 처리 중 오류가 발생했습니다.');
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handlePostDropdownAction = (type) => {
    switch(type) {
      case 'edit':
        if (isBlinded) {
          showAlert('블라인드 처리된 게시글은 수정할 수 없습니다.');
          return;
        }
        navigate(`/board/${postId}/edit`);
        break;
      case 'delete':
        handlePostDelete();
        break;
      case 'report':
        handleReport(post.id, post.userId, 'POST');
        break;
    }
  };

  const handlePostDelete = async () => {
    const deletePost = async () => {
      try {
        await api.delete(`${API_ENDPOINTS.COMMUNITY.USER}/board/${postId}`, {
          headers: { 'User-Id': currentUserId }
        });
        
        showAlert('게시글이 삭제되었습니다');
        setTimeout(() => {
          navigate(`/board/popular`);
        }, 1000);
      } catch (error) {
        console.error('Failed to delete post:', error);
        showAlert('게시글 삭제에 실패했습니다');
      }
    };

    showConfirm('정말 게시글을 삭제하시겠습니까?', deletePost);
  };

  const handleImageClick = (index) => {
    if (isBlinded) return; // 블라인드된 게시글은 이미지 확대 불가
    setSelectedImageIndex(index);
  };

  const closeImageModal = () => {
    setSelectedImageIndex(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <CirclesSpinner/>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>게시글을 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 헤더 - 목록으로 돌아가기 */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleGoBack}>
          목록으로 돌아가기
        </button>
      </div>

      {/* 메인 콘텐츠 */}
      <div className={styles.mainContent}>
        {/* 작성자 정보 및 제목 */}
        <div className={styles.postHeader}>
          <div className={styles.authorInfo}>
            <div className={styles.profileImage}>
              <img 
                src={isBlinded ? '/icons/common/default_profile.png' : (creatorProfile || '/icons/common/default_profile.png')} 
                alt="작성자 프로필"
                onClick={() => navigate(`/profile/${post.userId}`)}
              />
            </div>
            <div className={styles.authorDetails}>
              <h1 className={styles.postTitle}>
                {isBlinded ? '블라인드 처리된 게시글입니다' : post.title}
              </h1>
              {!isBlinded && (
                <div className={styles.postMeta}>
                  <span
                    className={styles.author}
                    onClick={() => navigate(`/profile/${post.userId}`)}
                  >
                    {post.creatorNickname} ({post.userId})
                  </span>
                  <span className={styles.date}>{formatDate(post.createdAt)}</span>
                  {post.updatedAt && (
                    <span className={styles.updatedDate}>
                      {formatDate(post.updatedAt)}에 수정됨
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* 드롭다운 메뉴 - 블라인드된 게시글은 작성자만 삭제 가능 */}
          <div className={styles.postActions}>
            <DetailDropdown
              isCreator={isCreator}
              onEdit={isBlinded ? null : () => handlePostDropdownAction('edit')}
              onDelete={() => handlePostDropdownAction('delete')}
              onReport={isCreator ? null : () => handlePostDropdownAction('report')}
              hideEdit={isBlinded}
            />
          </div>
        </div>

        {/* 컨텐츠와 상호작용 버튼 컨테이너 */}
        <div className={styles.contentInteractionContainer}>
          {/* 좋아요/북마크 버튼 - 블라인드된 게시글은 숨김 */}
          {!isBlinded && (
            <div className={styles.interactionButtons}>
              <button 
                className={`${styles.interactionButton} ${isLiked ? styles.liked : ''}`}
                onClick={handleLikeToggle}
              >
                <img 
                  src={isLiked ? '/icons/common/heart_fill.svg' : '/icons/common/heart_blank.svg'} 
                  alt="좋아요" 
                />
                <span className={styles.stats}>{likeCount}</span>
              </button>
              
              <button 
                className={`${styles.interactionButton} ${isBookmarked ? styles.bookmarked : ''}`}
                onClick={handleBookmarkToggle}
              >
                <img 
                  src={isBookmarked ? '/icons/common/bookmark_added.svg' : '/icons/common/bookmark.svg'} 
                  alt="북마크" 
                />
                <span className={styles.stats}>{bookmarkCount}</span>
              </button>
            </div>
          )}

          {/* 게시글 내용 */}
          <div className={styles.postContent}>
            {/* 이미지들 - 블라인드된 게시글은 숨김 */}
            {!isBlinded && post.images && post.images.length > 0 && (
              <div className={styles.imageSection}>
                <div className={styles.imageGrid}>
                  {post.images.map((imageUrl, index) => (
                    <div 
                      key={index} 
                      className={styles.imageItem}
                      onClick={() => handleImageClick(index)}
                    >
                      <img 
                        src={imageUrl} 
                        alt={`게시글 이미지 ${index + 1}`} 
                        className={styles.postImage}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 글 내용 */}
            <div className={styles.contentText}>
              {isBlinded ? '블라인드 처리된 게시글입니다.' : post.content}
            </div>
          </div>
        </div>
      </div>

      {/* 댓글 섹션 (TravelmateQA 스타일) */}
      <div className={styles.commentsSection}>
        <div className={styles.commentsHeader}>
          <h3 className={styles.commentsTitle}>댓글 ({comments.length})</h3>
        </div>

        {/* 댓글 목록 */}
        <div className={styles.commentsList}>
          {comments.length === 0 ? (
            <div className={styles.emptyState}>
              <p>아직 댓글이 없습니다. {!isBlinded && '첫 번째 댓글을 남겨보세요!'}</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className={styles.conversationGroup}>
                {/* 댓글 말풍선 */}
                <div className={styles.questionContainer}>
                  <div className={styles.profileImage}>
                    <img 
                      src={comment.blindStatus === 'BLINDED' ? '/icons/common/warning.png' : (comment.profileImage || '/icons/common/default_profile.png')} 
                      alt="프로필"
                      onClick={() => {
                        if (comment.blindStatus !== 'BLINDED') {
                          navigate(`/profile/${comment.userId}`);
                        }
                      }}
                    />
                  </div>
                  <div className={styles.questionBubble}>
                    <div className={styles.bubbleHeader}>
                      <div className={styles.userDetails}>
                        <span
                          className={styles.nickname}
                          onClick={() => {
                            if (comment.blindStatus !== 'BLINDED') {
                              navigate(`/profile/${comment.userId}`);
                            }
                          }}
                        >
                          {comment.blindStatus === 'BLINDED' ? '블라인드 사용자' : comment.nickname}
                        </span>
                        <span className={styles.timeAgo}>{formatTimeAgo(comment.createdAt)}</span>
                      </div>
                      {!comment.isDeleted && (
                        <DetailDropdown
                          isCreator={comment.userId === currentUserId}
                          onReport={() => handleReport(comment.id, comment.userId)}
                          onEdit={() => handleDropdownAction('edit', comment.id, comment.question)}
                          onDelete={() => handleDropdownAction('delete', comment.id)}
                        />
                      )}
                    </div>
                    <div className={styles.bubbleContent}>
                      {comment.blindStatus === 'BLINDED' ? '블라인드 된 글입니다.' : 
                      comment.isDeleted ? '삭제된 댓글입니다.' : comment.question}
                    </div>
                    {editingId === comment.id && (
                        <div className={styles.editForm}>
                          <textarea
                            className={styles.commentInput}
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            rows={3}
                          />
                          <div className={styles.editActions}>
                            <button 
                              className={styles.cancelButton}
                              onClick={handleEditCancel}
                            >
                              취소
                            </button>
                            <button 
                              className={styles.submitButton}
                              onClick={() => handleEditSubmit(comment.id)}
                              disabled={!editingText.trim()}
                            >
                              수정 완료
                            </button>
                          </div>
                        </div>
                      )}
                    <div className={styles.bubbleActions}>
                      <button 
                      className={styles.replyButton}
                      onClick={() => handleReplyClick(comment.id)}
                      disabled={comment.blindStatus === 'BLINDED' || comment.isDeleted || isBlinded}
                    >
                      댓글
                    </button>
                    </div>
                  </div>
                </div>

                {/* 답변들 */}
                {comment.replies.length > 0 && (
                  <div className={styles.repliesContainer}>
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className={styles.replyContainer}>
                        <div className={styles.profileImage}>
                          <img 
                            src={reply.blindStatus === 'BLINDED' ? '/icons/common/warning.png' : (reply.profileImage || '/icons/common/default_profile.png')} 
                            alt="프로필"
                            onClick={() => {
                              if (reply.blindStatus !== 'BLINDED') {
                                navigate(`/profile/${reply.userId}`);
                              }
                            }}
                          />
                        </div>
                        <div className={styles.replyBubble}>
                          <div className={styles.bubbleHeader}>
                            <div className={styles.userDetails}>
                              <span className={styles.nickname} onClick={() => navigate(`/profile/${reply.userId}`)}>
                                {reply.blindStatus === 'BLINDED' ? '블라인드 사용자' : reply.nickname}
                              </span>
                              <span className={styles.timeAgo}>{formatTimeAgo(reply.createdAt)}</span>
                            </div>
                            {!reply.isDeleted && (
                              <DetailDropdown
                                isCreator={reply.userId === currentUserId}
                                onReport={() => handleReport(reply.id, reply.userId)}
                                onEdit={() => handleDropdownAction('edit', reply.id, reply.answer)}
                                onDelete={() => handleDropdownAction('delete', reply.id)}
                              />
                            )}
                          </div>
                          <div className={styles.bubbleContent}>
                            {reply.blindStatus === 'BLINDED' ? '블라인드 된 글입니다.' : 
                            reply.isDeleted ? '삭제된 댓글입니다.' : reply.answer}
                          </div>
                          {editingId === reply.id && (
                            <div className={styles.editForm}>
                              <textarea
                                className={styles.editInput}
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                rows={2}
                              />
                              <div className={styles.editActions}>
                                <button 
                                  className={styles.cancelButton}
                                  onClick={handleEditCancel}
                                >
                                  취소
                                </button>
                                <button 
                                  className={styles.submitButton}
                                  onClick={() => handleEditSubmit(reply.id)}
                                  disabled={!editingText.trim()}
                                >
                                  수정 완료
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 답변 작성 - 블라인드된 게시글에서는 숨김 */}
                {activeReplyId === comment.id && isLogin && !isBlinded &&
                  comment.blindStatus !== 'BLINDED' && !comment.isDeleted && (
                  <div className={styles.replyForm}>
                    <div className={styles.profileImage}>
                      <img 
                        src={userProfile || '/icons/common/default_profile.png'} 
                        alt="내 프로필"
                      />
                    </div>
                    <div className={styles.replyInputContainer}>
                      <textarea
                        className={styles.replyInput}
                        placeholder="답변을 작성해주세요..."
                        value={replyTexts[comment.id] || ''}
                        onChange={(e) => setReplyTexts(prev => ({ 
                          ...prev, 
                          [comment.id]: e.target.value 
                        }))}
                        rows={2}
                      />
                      <div className={styles.replyActions}>
                        <button 
                          className={styles.cancelButton}
                          onClick={() => setActiveReplyId(null)}
                        >
                          취소
                        </button>
                        <button 
                          className={styles.submitButton}
                          onClick={() => handleReplySubmit(comment.id)}
                          disabled={!replyTexts[comment.id]?.trim()}
                        >
                          댓글 작성
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* 댓글 작성 - 블라인드된 게시글에서는 숨김 */}
        {isLogin && !isBlinded && (
          <div className={styles.commentForm}>
            <div className={styles.profileImage}>
              <img 
                src={userProfile || '/icons/common/default_profile.png'} 
                alt="내 프로필"
              />
            </div>
            <div className={styles.inputContainer}>
              <textarea
                className={styles.commentInput}
                placeholder="댓글을 작성해주세요"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <div className={styles.formActions}>
                <button 
                  className={styles.submitButton}
                  onClick={handleCommentSubmit}
                  disabled={!newComment.trim()}
                >
                  댓글 작성
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 이미지 확대 모달 - 블라인드되지 않은 경우에만 */}
      {selectedImageIndex !== null && post.images && !isBlinded && (
        <div className={styles.imageModalOverlay} onClick={closeImageModal}>
          <div className={styles.imageModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.imageCloseBtn} onClick={closeImageModal}>
              ✕
            </button>
            <img 
              src={post.images[selectedImageIndex]} 
              alt={`게시글 이미지 ${selectedImageIndex + 1}`}
              className={styles.enlargedImage}
            />
            <div className={styles.imageCounter}>
              {selectedImageIndex + 1} / {post.images.length}
            </div>
          </div>
        </div>
      )}

      {/* 신고 모달 */}
      <ReportModal
        show={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReportSubmit}
      />

      {/* ConfirmModal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={hideConfirm}
        onConfirm={confirmAction ? handleConfirmAction : null}
        message={confirmMessage}
        type={confirmType}
      />
    </div>
  );
};

export default BoardDetail;