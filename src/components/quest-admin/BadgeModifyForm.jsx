// BadgeModifyForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './BadgeModifyForm.module.css';
import API_ENDPOINTS from '../../utils/constants';

const BadgeModifyForm = ({ badgeId, onClose, onSave }) => {
  const [badgeData, setBadgeData] = useState(null);
  const [formData, setFormData] = useState({
    kor_title: '',
    eng_title: '',
    description: '',
    icon: null
  });
  const [questList, setQuestList] = useState([]);
  const [availableQuests, setAvailableQuests] = useState([]);
  const [showQuestSelector, setShowQuestSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [iconPreview, setIconPreview] = useState('');

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      return dateString;
    }
  };

  const fetchBadgeData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/admin-quests/badges/${badgeId}/modify`);
      const data = response.data;
      setBadgeData(data);
      setFormData({
        kor_title: data.kor_title,
        eng_title: data.eng_title,
        description: data.description,
        icon: null
      });
      setQuestList(data.quest_list || []);
      setIconPreview(data.icon);
    } catch (err) {
      console.error("Failed to fetch badge data", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableQuests = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.QUEST.ADMIN}/list`, {
        params: {
          pageNum: 1,
          limit: 100,
          status: 'all'
        }
      });
      setAvailableQuests(response.data.questList || []);
    } catch (err) {
      console.error("Failed to fetch available quests", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        icon: file
      }));
      
      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setIconPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveQuest = (questId) => {
    setQuestList(prev => prev.filter(quest => quest.quest_id !== questId));
  };

  const handleAddQuest = (quest) => {
    // 이미 추가된 퀘스트인지 확인
    const isAlreadyAdded = questList.some(q => q.quest_id === quest.quest_id);
    if (!isAlreadyAdded) {
      setQuestList(prev => [...prev, quest]);
    }
    setShowQuestSelector(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let iconUrl = null;
    
    try {
      if (formData.icon) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', formData.icon);
        
        const uploadResponse = await axios.post(
          `${API_ENDPOINTS.QUEST.ADMIN}/upload-image/badge`,
          uploadFormData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        iconUrl = uploadResponse.data.imageUrl;
        console.log('Icon uploaded to S3:', iconUrl);
      }

      const updateData = {
        kor_title: formData.kor_title,
        eng_title: formData.eng_title,
        description: formData.description,
        icon_url: iconUrl, 
        quest_ids: questList.map(quest => quest.quest_id)
      };

      const response = await axios.put(
        `http://localhost:8080/api/admin-quests/badges/${badgeId}`, 
        updateData,
        {
          headers: {
            'Content-Type': 'application/json' 
          }
        }
      );
      
      console.log('Badge updated successfully:', response.data);
      alert('뱃지가 성공적으로 수정되었습니다.'); 
      
      if (onSave) onSave(badgeId); 
      if (onClose) onClose(badgeId); 
      
    } catch (error) {
      console.error('Failed to update badge:', error);
      
      // 더 상세한 에러 처리
      if (error.response && error.response.data && error.response.data.error) {
        alert(`뱃지 수정에 실패했습니다: ${error.response.data.error}`);
      } else {
        alert('뱃지 수정에 실패했습니다.');
      }
    }
  };

  useEffect(() => {
    if (badgeId) {
      fetchBadgeData();
      fetchAvailableQuests();
    }
  }, [badgeId]);

  if (loading) {
    return (
      <div className={styles.badgeModifyForm}>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  if (!badgeData) {
    return (
      <div className={styles.badgeModifyForm}>
        <div className={styles.error}>뱃지 정보를 불러올 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className={styles.badgeModifyForm}>
      <div className={styles.header}>
        <h2 className={styles.title}>뱃지 수정</h2>
        <button className={styles.closeButton} onClick={onClose}>✕</button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 기본 정보 섹션 */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>기본 정보</h3>
          
          <div className={styles.basicInfo}>
            <div className={styles.leftColumn}>
              <div className={styles.formGroup}>
                <label className={styles.label}>한국어 제목</label>
                <input
                  type="text"
                  name="kor_title"
                  value={formData.kor_title}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>영어 제목</label>
                <input
                  type="text"
                  name="eng_title"
                  value={formData.eng_title}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>

              <div className={`${styles.formGroup} ${styles.textareaGroup}`}>
                <label className={styles.label}>설명</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  rows="4"
                  required
                />
              </div>

            </div>

            <div className={styles.rightColumn}>
              <div className={styles.iconPreview}>
                <label className={styles.label}>현재 아이콘</label>
                <div className={styles.iconClickArea} onClick={() => document.getElementById('iconFileInput').click()}>
                  <img 
                    src={iconPreview} 
                    alt="Badge Icon" 
                    className={styles.previewImage}
                  />
                  <div className={styles.iconOverlay}>
                    <span className={styles.iconChangeText}>클릭하여 변경</span>
                  </div>
                </div>
                <input
                  id="iconFileInput"
                  type="file"
                  accept="image/*"
                  onChange={handleIconChange}
                  className={styles.hiddenFileInput}
                />
                <small className={styles.fileHint}>이미지를 클릭하여 아이콘을 변경하세요</small>
              </div>
              
              <div className={styles.badgeInfo}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>ID:</span>
                  <span className={styles.infoValue}>{badgeData.id}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>난이도:</span>
                  <span className={`${styles.difficultyTag} ${styles[`difficulty${badgeData.difficulty}`]}`}>
                    Level {badgeData.difficulty}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>생성일:</span>
                  <span className={styles.infoValue}>{formatDate(badgeData.created_at)}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>획득자 수:</span>
                  <span className={styles.awardedValue}>{badgeData.count_awarded}명</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 연결된 퀘스트 섹션 */}
        <div className={styles.section}>
          <div className={styles.questHeader}>
            <h3 className={styles.sectionTitle}>연결된 퀘스트 ({questList.length}개)</h3>
            <button 
              type="button" 
              className={styles.addButton}
              onClick={() => setShowQuestSelector(true)}
            >
              + 퀘스트 추가
            </button>
          </div>

          {questList.length > 0 ? (
            <div className={styles.questTable}>
              {/* 테이블 헤더 */}
              <div className={styles.questTableHeader}>
                <div className={styles.questHeaderCell}>ID</div>
                <div className={styles.questHeaderCell}>제목</div>
                <div className={styles.questHeaderCell}>카테고리</div>
                <div className={styles.questHeaderCell}>난이도</div>
                <div className={styles.questHeaderCell}>XP</div>
                <div className={styles.questHeaderCell}>상태</div>
                <div className={styles.questHeaderCell}>액션</div>
              </div>

              {/* 테이블 바디 */}
              <div className={styles.questTableBody}>
                {questList.map(quest => (
                  <div key={quest.quest_id} className={styles.questTableRow}>
                    <div className={styles.questCell}>{quest.quest_id}</div>
                    <div className={styles.questCell} title={quest.title}>
                      <div className={styles.questTitle}>{quest.title}</div>
                    </div>
                    <div className={styles.questCell}>{quest.category}</div>
                    <div className={styles.questCell}>
                      <span className={`${styles.questDifficultyTag} ${styles[quest.difficulty?.toLowerCase()]}`}>
                        {quest.difficulty}
                      </span>
                    </div>
                    <div className={styles.questCell}>{quest.xp}</div>
                    <div className={styles.questCell}>
                      <span className={`${styles.questStatusTag} ${styles[quest.status?.toLowerCase()]}`}>
                        {quest.status}
                      </span>
                    </div>
                    <div className={styles.questCell}>
                      <button 
                        type="button"
                        className={styles.removeButton}
                        onClick={() => handleRemoveQuest(quest.quest_id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.noQuests}>연결된 퀘스트가 없습니다.</div>
          )}
        </div>

        {/* 제출 버튼 */}
        <div className={styles.actions}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            취소
          </button>
          <button type="submit" className={styles.saveButton}>
            저장
          </button>
        </div>
      </form>

      {/* 퀘스트 선택 모달 */}
      {showQuestSelector && (
        <div className={styles.modal} onClick={() => setShowQuestSelector(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>퀘스트 추가</h3>
              <button 
                className={styles.modalCloseButton}
                onClick={() => setShowQuestSelector(false)}
              >
                ✕
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.availableQuestsTable}>
                <div className={styles.questModalTableHeader}>
                  <div className={styles.questHeaderCell}>ID</div>
                  <div className={styles.questHeaderCell}>제목</div>
                  <div className={styles.questHeaderCell}>카테고리</div>
                  <div className={styles.questHeaderCell}>난이도</div>
                  <div className={styles.questHeaderCell}>XP</div>
                  <div className={styles.questHeaderCell}>액션</div>
                </div>
                
                <div className={styles.modalQuestTableBody}>
                  {availableQuests
                    .filter(quest => !questList.some(q => q.quest_id === quest.quest_id))
                    .map(quest => (
                    <div key={quest.quest_id} className={styles.questModalTableRow}>
                      <div className={styles.questCell}>{quest.quest_id}</div>
                      <div className={styles.questCell} title={quest.title}>
                        <div className={styles.questTitle}>{quest.title}</div>
                      </div>
                      <div className={styles.questCell}>{quest.category}</div>
                      <div className={styles.questCell}>
                        <span className={`${styles.questDifficultyTag} ${styles[quest.difficulty?.toLowerCase()]}`}>
                          {quest.difficulty}
                        </span>
                      </div>
                      <div className={styles.questCell}>{quest.xp}</div>
                      <div className={styles.questCell}>
                        <button 
                          className={styles.addQuestButton}
                          onClick={() => handleAddQuest(quest)}
                        >
                          추가
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(BadgeModifyForm);