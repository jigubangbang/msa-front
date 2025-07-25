import React, { useState, useEffect } from 'react';
import api from '../../../apis/api';
import API_ENDPOINTS from '../../../utils/constants';
import styles from './TravelmateQA.module.css';
import DetailDropdown from '../../common/DetailDropdown/DetailDropdown';
import ReportModal from '../../common/Modal/ReportModal';
import ConfirmModal from '../../common/ErrorModal/ConfirmModal';
import SimpleConfirmModal from '../../common/ErrorModal/SimpleConfirmModal';
import LoginConfirmModal from '../../common/LoginConfirmModal/LoginConfirmModal';
import { useNavigate } from 'react-router-dom';
import CirclesSpinner from '../../common/Spinner/CirclesSpinner';

const TravelmateQA = ({ postId, isLogin, currentUserId }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [replyTexts, setReplyTexts] = useState({});
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState(null); 
  
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const [isBlind, setIsBlind] = useState(false);

  // Alert 모달 상태 (ConfirmModal)
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // 삭제 확인 모달 상태 (SimpleConfirmModal)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmMessage, setDeleteConfirmMessage] = useState('');
  const [deleteConfirmCallback, setDeleteConfirmCallback] = useState(null);

  // 로그인 확인 모달 상태 (LoginConfirmModal)
  const [showLoginConfirm, setShowLoginConfirm] = useState(false);

  const navigate = useNavigate();

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

  useEffect(() => {
    if (postId) {
      fetchQuestions();
    }
  }, [postId]);

  const fetchQuestions = async () => {
    setLoading(true);
  try {
    const response3 = await api.get(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/travelmate/${postId}/status`);
    const response = await api.get(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/travelmate/${postId}/comments`);
    const response2 = await api.get(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/user-profile/${currentUserId}`);
    // 서버에서 받은 데이터를 기존 형태로 변환
    const transformedQuestions = response.data.map(comment => ({
        id: comment.id,
        userId: comment.userId,
        nickname: comment.nickname,
        profileImage: comment.profileImage,
        question: comment.content, 
        createdAt: comment.createdAt,
        blindStatus: comment.blindStatus,
        isDeleted: comment.isDeleted,
        replies: comment.replies ? comment.replies.map(reply => ({
          id: reply.id,
          userId: reply.userId,
          nickname: reply.nickname,
          profileImage: reply.profileImage,
          answer: reply.content, 
          createdAt: reply.createdAt,
          blindStatus: reply.blindStatus,
          isDeleted: reply.isDeleted
        })) : []
      }));
      
    setQuestions(transformedQuestions);
    setUserProfile(response2.data);
    setIsBlind(response3.data.blindStatus !== "VISIBLE");

    console.log(isBlind);

    } catch (error) {
      console.error('Failed to fetch questions:', error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionSubmit = async () => {
    if (!isLogin || !newQuestion.trim()) return;

    try {
      await api.post(
        `${API_ENDPOINTS.COMMUNITY.USER}/travelmate/${postId}/comments`,
        { content: newQuestion },
        {
          headers: {
            'User-Id': currentUserId,
          },
        }
      );
      
      setNewQuestion('');
      fetchQuestions(); 
      showAlert('질문이 등록되었습니다.');
    } catch (error) {
      console.error('Failed to submit question:', error);
      const errorMessage = error.response?.data?.error || '질문 등록에 실패했습니다.';
      showAlert(errorMessage);
    }
  };

  const handleReplySubmit = async (questionId) => {
    const replyText = replyTexts[questionId];
    if (!isLogin || !replyText?.trim()) return;

    try {
      await api.post(
        `${API_ENDPOINTS.COMMUNITY.USER}/travelmate/${postId}/comments/${questionId}/replies`,
        { content: replyText },
        {
          headers: {
            'User-Id': currentUserId,
          },
        }
      );
            
      setReplyTexts(prev => ({ ...prev, [questionId]: '' }));
      setActiveReplyId(null);
      fetchQuestions(); 
      showAlert('답변이 등록되었습니다.');
    } catch (error) {
      console.error('Failed to submit reply:', error);
      const errorMessage = error.response?.data?.error || '답변 등록에 실패했습니다.';
      showAlert(errorMessage);
    }
  };

  const handleReplyClick = (questionId) => {
    setActiveReplyId(activeReplyId === questionId ? null : questionId);
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

  const handleReportSubmit = async (reportData) => { 
    try {
      const payload = {
        reporterId: currentUserId,
        targetUserId: reportTarget.userId, 
        contentSubtype: 'TRAVELMATE',
        contentType: 'COMMENT',
        contentId: reportTarget.id, 
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
      setReportTarget(null);
      showAlert('신고가 접수되었습니다.');
    } catch (error) {
      console.error('Failed to submit report:', error);
      const errorMessage = error.response?.data?.error || '신고 접수에 실패했습니다.';
      showAlert(errorMessage);
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
        `${API_ENDPOINTS.COMMUNITY.USER}/travelmate/${postId}/comments/${commentId}`,
        { content: editingText.trim() },
        {
          headers: {
            'User-Id': currentUserId,
          },
        }
      );
      
      setEditingId(null);
      setEditingText('');
      fetchQuestions();
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
    customDeleteConfirm(
      '정말로 댓글을 삭제하시겠습니까?',
      async () => {
        try {
          await api.delete(`${API_ENDPOINTS.COMMUNITY.USER}/travelmate/${postId}/comments/${commentId}`, {
            headers: {
              'User-Id': currentUserId,
            },
          });
          
          fetchQuestions(); // 새로고침
          showAlert('댓글이 삭제되었습니다.');
        } catch (error) {
          console.error('Failed to delete comment:', error);
          const errorMessage = error.response?.data?.error || '댓글 삭제에 실패했습니다.';
          showAlert(errorMessage);
        }
      }
    );
  };

  const handleReport = (id, userId) => {
    if (!isLogin) {
      setShowLoginConfirm(true);
      return;
    }
    setReportTarget({ id, userId });
    setShowReportModal(true);
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
    return `${diffInMonths}개월전`;
  };

  if (loading) {
    return (
      <div className={styles.travelmateQA}>
        <CirclesSpinner/>
      </div>
    );
  }

  if (isBlind){
    return (
      <div className={styles.travelmateQA}>
        <div className={styles.header}>
          <h3 className={styles.title}>모임 질문 및 답변 ({questions.length})</h3>
        </div>
        <div className={styles.blindedMessage}>
        <p>블라인드 처리된 게시글로 댓글을 확인할 수 없습니다</p>
      </div>
      </div>
    );
  }

  return (
    <div className={styles.travelmateQA}>
      <div className={styles.header}>
        <h3 className={styles.title}>모임 질문 및 답변 ({questions.length})</h3>
      </div>

      {/* 질문 목록 */}
      <div className={styles.questionsList}>
        {questions.length === 0 ? (
          <div className={styles.emptyState}>
            <p>등록된 질문이 없습니다. 첫 번째 질문을 남겨보세요!</p>
          </div>
        ) : (
          questions.map((question) => (
            <div key={question.id} className={styles.conversationGroup}>
              {/* 질문 말풍선 */}
              <div className={styles.questionContainer}>
                <div className={styles.profileImage}>
                  <img 
                    src={question.blindStatus === 'BLINDED' ? '/icons/common/warning.png' : (question.profileImage || '/icons/common/default_profile.png')} 
                    alt="프로필"
                    onClick={() => (question.blindStatus !== 'BLINDED' && navigate(`/profile/${question.userId}`))}
                  />
                </div>
                <div className={styles.questionBubble}>
                  <div className={styles.bubbleHeader}>
                    <div className={styles.userDetails}>
                      <span className={styles.nickname} onClick={() => (question.blindStatus !== 'BLINDED' && navigate(`/profile/${question.userId}`))}>
                        {question.blindStatus === 'BLINDED' ? '블라인드 사용자' : question.nickname}
                      </span>
                      <span className={styles.timeAgo}>{formatTimeAgo(question.createdAt)}</span>
                    </div>
                    {!question.isDeleted && (
                      <DetailDropdown
                        isCreator={question.userId === currentUserId}
                        onReport={() => handleReport(question.id, question.userId)}
                        onEdit={() => handleDropdownAction('edit', question.id, question.question)}
                        onDelete={() => handleDropdownAction('delete', question.id)}
                      />
                    )}
                  </div>
                  <div className={styles.bubbleContent}>
                    {question.blindStatus === 'BLINDED' ? '블라인드 된 글입니다' : 
                    question.isDeleted ? '삭제된 댓글입니다' : question.question}
                  </div>
                  {editingId === question.id && (
                      <div className={styles.editForm}>
                        <textarea
                          className={styles.questionInput}
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
                            onClick={() => handleEditSubmit(question.id)}
                            disabled={!editingText.trim()}
                          >
                            수정 완료
                          </button>
                        </div>
                      </div>
                    )}
                  <div className={styles.bubbleActions}>
                    <button 
                    className={styles.submitButton}
                    onClick={() => handleReplyClick(question.id)}
                    disabled={question.blindStatus === 'BLINDED' || question.isDeleted}
                  >
                    답글
                  </button>
                  </div>
                </div>
              </div>

              {/* 답변들 */}
              {question.replies.length > 0 && (
                <div className={styles.repliesContainer}>
                  {question.replies.map((reply) => (
                    <div key={reply.id} className={styles.replyContainer}>
                      <div className={styles.profileImage}>
                        <img 
                          src={reply.blindStatus === 'BLINDED' ? '/icons/common/warning.png' : (reply.profileImage || '/icons/common/default_profile.png')} 
                          alt="프로필"
                          onClick={() => {navigate(`/profile/${reply.userId}`)}}
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
                              className={styles.questionInput}
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

              {/* 답변 작성 */}
              {activeReplyId === question.id && isLogin && 
                question.blindStatus !== 'BLINDED' && !question.isDeleted && (
                <div className={styles.replyForm}>
                  <div className={styles.profileImage}>
                    <img 
                      src={userProfile || '/icons/common/default_profile.png'} 
                      alt="내 프로필"
                    />
                  </div>
                  <div className={styles.replyInputContainer}>
                    <textarea
                      className={styles.questionInput}
                      placeholder="답변을 작성해주세요..."
                      value={replyTexts[question.id] || ''}
                      onChange={(e) => setReplyTexts(prev => ({ 
                        ...prev, 
                        [question.id]: e.target.value 
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
                        onClick={() => handleReplySubmit(question.id)}
                        disabled={!replyTexts[question.id]?.trim()}
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

      {/* 질문 작성 */}
      {isLogin && (
        <div className={styles.questionForm}>
          <img 
            src={userProfile || '/icons/common/default_profile.png'} 
            alt="내 프로필"
            className={styles.profileImage}
          />
          <textarea
            className={styles.questionInput}
            placeholder="질문을 작성해 주세요"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            rows={3}
          />
          <button 
            className={styles.submitButton}
            onClick={handleQuestionSubmit}
            disabled={!newQuestion.trim()}
          >
            질문 등록
          </button>
        </div>
      )}

      {/* 신고 모달 (ReportModal) */}
      <ReportModal
        show={showReportModal}
        onClose={() => setShowReportModal(false)}
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

export default TravelmateQA;