import React, { useState, useEffect } from 'react';
import styles from './QuestCertificationViewModal.module.css';
import API_ENDPOINTS from '../../../utils/constants';
import AlertModal from '../QuestActionModal/AlertModal';
import api from '../../../apis/api';

const QuestCertificationViewModal = ({ 
  isOpen, 
  onClose, 
  questUserId 
}) => {
  const [certificationData, setCertificationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  useEffect(() => {
    if (isOpen && questUserId) {
      fetchCertificationData();
    }
  }, [isOpen, questUserId]);

  // 알림 표시 함수
  const showAlertMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  // 인증 데이터 가져오기
  const fetchCertificationData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`${API_ENDPOINTS.QUEST.USER}/certificate/${questUserId}`, {
        headers: {
            'User-Id': currentUserId
        }
    });
      setCertificationData(response.data);
      console.log('인증 데이터 조회 성공:', response.data);
    } catch (error) {
      console.error('인증 데이터 조회 실패:', error);
      showAlertMessage('인증 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 난이도 텍스트 변환
  const getDifficultyText = (difficulty) => {
    switch(difficulty) {
      case 'EASY': return '초급';
      case 'MEDIUM': return '중급';
      case 'HARD': return '고급';
      default: return difficulty;
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 퀘스트 조건 추출
  const getQuestConditions = (description) => {
    if (!description) return '퀘스트 조건 정보가 없습니다.';
    
    if (description.includes('✅ 퀘스트 조건:')) {
      return description.split('✅ 퀘스트 조건:')[1]?.trim() || '퀘스트 조건 정보가 없습니다.';
    }
    return description;
  };

  // 이미지 클릭 핸들러
  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
  };

  // 이미지 모달 닫기
  const closeImageModal = () => {
    setSelectedImageIndex(null);
  };

  // 모달 클릭 핸들러
  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.modalOverlay} onClick={handleModalClick}>
        <div className={styles.questModal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <button className={styles.closeBtn} onClick={onClose}>
              ✕
            </button>
          </div>
          
          <div className={styles.modalContent}>
            {loading ? (
              <div className={styles.loading}>
                <div className={styles.loadingSpinner}></div>
                <p>인증 데이터를 불러오는 중...</p>
              </div>
            ) : certificationData ? (
              <div className={styles.certificationContent}>
                <h2 className={styles.questTitle}>퀘스트 인증 내역</h2>
                
                <div className={styles.questInfo}>
                  <h3 className={styles.questName}>{certificationData.title}</h3>
                  <div className={styles.questMeta}>
                    <span className={styles.difficulty}>
                      난이도 {getDifficultyText(certificationData.difficulty)}
                    </span>
                    <span className={styles.separator}>|</span>
                    <span className={styles.xp}>XP {certificationData.xp}</span>
                    <span className={styles.separator}>|</span>
                    <span className={styles.status}>
                      상태: {certificationData.status === 'COMPLETED' ? '완료' : certificationData.status}
                    </span>
                  </div>
                </div>

                <div className={styles.questConditions}>
                  <h4>퀘스트 조건</h4>
                  <div className={styles.conditionText}>
                    {getQuestConditions(certificationData.quest_description)}
                  </div>
                </div>

                <div className={styles.completionInfo}>
                  <div className={styles.dateInfo}>
                    <div className={styles.dateItem}>
                      <span className={styles.dateLabel}>시작일:</span>
                      <span className={styles.dateValue}>{formatDate(certificationData.started_at)}</span>
                    </div>
                    <div className={styles.dateItem}>
                      <span className={styles.dateLabel}>완료일:</span>
                      <span className={styles.dateValue}>{formatDate(certificationData.completed_at)}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.imageSection}>
                  <h4>인증 이미지</h4>
                  <div className={styles.imageGrid}>
                    {certificationData.image_list && certificationData.image_list.length > 0 ? (
                      certificationData.image_list.map((imageUrl, index) => (
                        <div 
                          key={index} 
                          className={styles.imageItem}
                          onClick={() => handleImageClick(index)}
                        >
                          <img 
                            src={imageUrl} 
                            alt={`인증 이미지 ${index + 1}`} 
                            className={styles.certificationImage}
                          />
                        </div>
                      ))
                    ) : (
                      <p className={styles.noImages}>인증 이미지가 없습니다.</p>
                    )}
                  </div>
                </div>

                <div className={styles.descriptionSection}>
                  <h4>인증 설명</h4>
                  <div className={styles.descriptionContent}>
                    {certificationData.description || '인증 설명이 없습니다.'}
                  </div>
                </div>

                <div className={styles.buttonSection}>
                  <button 
                    className={`${styles.closeButton} ${styles.darkButton}`}
                    onClick={onClose}
                  >
                    닫기
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.error}>
                <p>인증 데이터를 불러올 수 없습니다.</p>
                <button 
                  className={`${styles.retryButton} ${styles.outlineButton}`}
                  onClick={fetchCertificationData}
                >
                  다시 시도
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 이미지 확대 모달 */}
      {selectedImageIndex !== null && certificationData?.image_list && (
        <div className={styles.imageModalOverlay} onClick={closeImageModal}>
          <div className={styles.imageModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.imageCloseBtn} onClick={closeImageModal}>
              ✕
            </button>
            <img 
              src={certificationData.image_list[selectedImageIndex]} 
              alt={`인증 이미지 ${selectedImageIndex + 1}`}
              className={styles.enlargedImage}
            />
            <div className={styles.imageCounter}>
              {selectedImageIndex + 1} / {certificationData.image_list.length}
            </div>
          </div>
        </div>
      )}

      {/* 알림 모달 */}
      <AlertModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title="알림"
        message={alertMessage}
      />
    </>
  );
};

export default QuestCertificationViewModal;