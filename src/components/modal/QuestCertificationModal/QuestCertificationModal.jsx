import React, { useState, useRef, useEffect } from 'react';
import styles from './QuestCertificationModal.module.css';
import API_ENDPOINTS from '../../../utils/constants';
import QuestActionModal from '../QuestActionModal/QuestActionModal';
import AlertModal from '../QuestActionModal/AlertModal';
import api from '../../../apis/api';
import CertiPhotoIcon from '../../../assets/quest/certiphoto.svg';
import { Circles } from 'react-loader-spinner';

const QuestCertificationModal = ({ 
  isOpen, 
  onClose, 
  questData,
  questUserId,
  onSuccess,
  currentUserId
}) => {
  const INITIAL_IMAGE_COUNT = 5;
  const MAX_IMAGE_COUNT = 10;

  const [images, setImages] = useState(Array(INITIAL_IMAGE_COUNT).fill(null));
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [successData, setSuccessData] = useState(null); 
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState(''); 
  const fileInputRefs = useRef([]);

  useEffect(() => {
    fileInputRefs.current = Array(images.length)
      .fill(null)
      .map((_, i) => fileInputRefs.current[i] || React.createRef());
  }, [images.length]);

  // 알림 표시 함수
  const showAlertMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = (index, event) => {
    const file = event.target.files[0];
    setIsFileDialogOpen(false);

    if (file) {
      // 파일 검증
      if (file.size > 5 * 1024 * 1024) {
        showAlertMessage('파일 크기는 5MB 이하여야 합니다.');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        showAlertMessage('이미지 파일만 업로드 가능합니다.');
        return;
      }

      // Object URL로 미리보기 생성
      const previewUrl = URL.createObjectURL(file);

      const newImages = [...images];
      newImages[index] = {
        file: file,
        preview: previewUrl,
        url: null
      };
      setImages(newImages);
    }
  };

  // 파일 선택 다이얼로그 열기
  const openFileDialog = (index, e) => {
    e.stopPropagation();
    setIsFileDialogOpen(true);
    fileInputRefs.current[index]?.current?.click();
  };

  // 이미지 슬롯 추가
  const addImageSlot = () => {
    if (images.length < MAX_IMAGE_COUNT) {
      setImages(prev => [...prev, null]);
    }
  };

  // 이미지 제거
  const removeImage = (index) => {
    const target = images[index];
    if (target?.preview) {
      URL.revokeObjectURL(target.preview);
    }

    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
    
    if (fileInputRefs.current[index]?.current) {
      fileInputRefs.current[index].current.value = '';
    }
  };

  // 퀘스트 완료 제출
  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const uploadedImageUrls = [];
      
      for (let i = 0; i < images.length; i++) {
        if (images[i] && images[i].file) {
          const formData = new FormData();
          formData.append("file", images[i].file);

          try {
            const response = await api.post(`${API_ENDPOINTS.QUEST.USER}/${questUserId}/upload-image`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
            
            uploadedImageUrls.push(response.data.imageUrl);
            console.log(`이미지 ${i + 1} 업로드 성공:`, response.data.imageUrl);
            
          } catch (uploadError) {
            console.error("Image upload failed:", uploadError);
            showAlertMessage(`이미지 ${i + 1} 업로드에 실패했습니다.`);
            return;
          }
        }
      }

      if (uploadedImageUrls.length === 0) {
        showAlertMessage('최소 1개의 이미지를 업로드해주세요.');
        return;
      }

      const questCerti = {
        image_list: uploadedImageUrls,
        quest_description: description
      };

      console.log("questUserID: ", questUserId);
      console.log("questCerti: ", questCerti);

      // 퀘스트 완료 API 호출
      const response = await api.post(`${API_ENDPOINTS.QUEST.USER}/${questUserId}/complete`, questCerti, {
      headers: {
          'Content-Type': 'application/json',
          'User-Id': currentUserId
      }
  });

      console.log('퀘스트 인증 성공:', response.data);
      
      // alert 대신 성공 모달 표시
      setSuccessData(response.data); // 응답 데이터 저장
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('퀘스트 인증 실패:', error);
      showAlertMessage('퀘스트 인증 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 모달 초기화 함수
  const resetModal = () => {
    // 기존 이미지들의 Object URL 해제
    images.forEach(image => {
      if (image?.preview) {
        URL.revokeObjectURL(image.preview);
      }
    });
    
    // 상태 초기화
    setImages(Array(INITIAL_IMAGE_COUNT).fill(null));
    setDescription('');
    setIsSubmitting(false);
    setIsFileDialogOpen(false);
    
    // 파일 input들 초기화
    fileInputRefs.current.forEach(ref => {
      if (ref?.current) {
        ref.current.value = '';
      }
    });
  };

  // 기존 onClose를 감싸는 함수
  const handleClose = () => {
    resetModal();
    onClose();
  };

  // 성공 모달 확인 핸들러
  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    resetModal();
    onClose(); // QuestCertificationModal 닫기
    
    // 성공 시 부모 컴포넌트에 알림
    if (onSuccess && successData) {
      onSuccess(successData);
    }
  };

  // 모달 클릭 핸들러
  const handleModalClick = (e) => {
    if (e.target === e.currentTarget && !isFileDialogOpen) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.modalOverlay} onClick={handleModalClick}>
        <div className={styles.questModal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2 className={styles.questTitle}>퀘스트 인증하기</h2>
            <button className={styles.closeBtn} onClick={handleClose}>
              ✕
            </button>
          </div>
          <div className={styles.modalContent}>
            <div className={styles.certificationContent}>
              <div className={styles.scrollableContent}>
                <div className={styles.questInfo}>
                  <h3 className={styles.questName}>퀘스트명: {questData?.title || '존재하지 않는 퀘스트입니다'}</h3>
                  <div className={styles.questMeta}>
                    <span className={styles.difficulty}>
                      난이도 {questData?.difficulty === 'HARD' ? '고급' : 
                              questData?.difficulty === 'MEDIUM' ? '중급' : '하급'}
                    </span>
                    <span className={styles.separator}>|</span>
                    <span className={styles.xp}>XP {questData?.xp || 1000}</span>
                  </div>
                </div>

                <div className={styles.questConditions}>
                  {questData?.description && (
                    <div className={styles.conditionText}>
                      {questData.description.includes('✅ 퀘스트 조건:') 
                        ? questData.description.split('✅ 퀘스트 조건:')[1]?.trim()
                        : '퀘스트 인증 설명 오류'
                      }
                    </div>
                  )}
                </div>

                <div className={styles.imageUploadSection}>
                  <h4>인증 이미지 업로드</h4>
                  <div className={styles.imageSlotContainer}>
                    {images.map((image, index) => (
                      <div key={index} className={styles.imageSlot}>
                        <input
                          type="file"
                          ref={fileInputRefs.current[index]}
                          accept="image/*"
                          onChange={(e) => handleImageUpload(index, e)}
                          onCancel={() => setIsFileDialogOpen(false)}
                          style={{ display: 'none' }}
                        />
                        {image ? (
                          <div className={styles.imagePreview}>
                            <img src={image.preview} alt={`업로드된 이미지 ${index + 1}`} />
                            <button 
                              className={styles.removeImageBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(index);
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div 
                            className={styles.emptySlot}
                            onClick={(e) => openFileDialog(index, e)}
                          >
                            <img src={CertiPhotoIcon} alt="사진 업로드" className={styles.uploadIcon} />
                            <p>이미지 업로드</p>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {images.length < MAX_IMAGE_COUNT && (
                      <div 
                        className={styles.addSlot} 
                        onClick={(e) => {
                          e.stopPropagation();
                          addImageSlot();
                        }}
                      >
                        <span>➕</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.descriptionSection}>
                  <h4>퀘스트 인증 설명</h4>
                  <textarea
                    className={styles.descriptionInput}
                    placeholder="퀘스트 인증에 대한 설명을 입력해 주세요"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                  />
                </div>
              </div>

              <div className={styles.buttonSection}>
                <button 
                  className={`${styles.cancelBtn} ${styles.outlineButton}`}
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  인증 취소하기
                </button>
                <button 
                  className={`${styles.completeBtn} ${styles.darkButton}`}
                  onClick={handleComplete}
                  disabled={isSubmitting || images.every(img => !img)}
                >
                  {isSubmitting ? (
                    <Circles height="20" width="20" color="#fff" />
                  ) : (
                    '퀘스트 인증하기'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 성공 모달 - QuestActionModal 사용 */}
      <QuestActionModal
        isOpen={showSuccessModal}
        onClose={handleSuccessConfirm}
        actionType="success"
        questTitle="퀘스트 인증"
        resultMessage="퀘스트 인증이 완료되었습니다!"
        isSuccessResult={true}
        showResultDirectly={true}
        onSuccess={handleSuccessConfirm}
        currentUserId={currentUserId}
      />

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

export default QuestCertificationModal;