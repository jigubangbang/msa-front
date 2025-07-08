// BadgeCreateForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './BadgeCreateForm.module.css';
import API_ENDPOINTS from '../../utils/constants';

const BadgeCreateForm = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: '',
    kor_title: '',
    eng_title: '',
    description: '',
    icon: null,
    difficulty: '1'
  });
  const [questList, setQuestList] = useState([]);
  const [availableQuests, setAvailableQuests] = useState([]);
  const [showQuestSelector, setShowQuestSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [iconPreview, setIconPreview] = useState('');
  const [idCheckStatus, setIdCheckStatus] = useState(null); // null, 'checking', 'available', 'unavailable'
  const [suggestedId, setSuggestedId] = useState(null);
  
  // 유효성 검사 상태
  const [validationErrors, setValidationErrors] = useState({});
  const [fieldValidation, setFieldValidation] = useState({
    kor_title: null,
    eng_title: null,
    description: null,
    icon: null
  });

  const difficulties = [
    { value: '1', label: 'Easy' },
    { value: '2', label: 'Normal' },
    { value: '3', label: 'Hard' }
  ];

  // 유효성 검사 함수들
  const validateField = (name, value) => {
    switch (name) {
      case 'kor_title':
        if (!value.trim()) {
          return { isValid: false, error: '한국어 제목은 필수입니다' };
        } else if (value.length > 100) {
          return { isValid: false, error: '한국어 제목은 100자를 초과할 수 없습니다' };
        }
        return { isValid: true, error: null };
        
      case 'eng_title':
        if (!value.trim()) {
          return { isValid: false, error: '영어 제목은 필수입니다' };
        } else if (value.length > 100) {
          return { isValid: false, error: '영어 제목은 100자를 초과할 수 없습니다' };
        }
        return { isValid: true, error: null };
        
      case 'description':
        if (!value.trim()) {
          return { isValid: false, error: '설명은 필수입니다' };
        } else if (value.length > 500) {
          return { isValid: false, error: '설명은 500자를 초과할 수 없습니다' };
        }
        return { isValid: true, error: null };
        
      default:
        return { isValid: true, error: null };
    }
  };

  const validateIcon = () => {
    if (!formData.icon) {
      return { isValid: false, error: '아이콘은 필수입니다' };
    }
    return { isValid: true, error: null };
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

  const checkIdAvailability = async () => {
    if (!formData.id) {
      alert('ID를 입력해주세요.');
      return;
    }

    setIdCheckStatus('checking');
    try {
      const response = await axios.get(`${API_ENDPOINTS.QUEST.ADMIN}/badges/check-id/${formData.id}`);
      
      if (response.data.available) {
        setIdCheckStatus('available');
        setSuggestedId(null);
      } else {
        setIdCheckStatus('unavailable');
        setSuggestedId(response.data.suggestedId);
      }
    } catch (err) {
      console.error("Failed to check ID availability", err);
      setIdCheckStatus('unavailable');
      setSuggestedId(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // ID가 변경되면 확인 상태 초기화
    if (name === 'id') {
      setIdCheckStatus(null);
      setSuggestedId(null);
    }
    
    // 실시간 유효성 검사
    if (['kor_title', 'eng_title', 'description'].includes(name)) {
      const validation = validateField(name, value);
      setFieldValidation(prev => ({
        ...prev,
        [name]: validation.isValid ? 'valid' : 'invalid'
      }));
      setValidationErrors(prev => ({
        ...prev,
        [name]: validation.error
      }));
    }
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        icon: file
      }));
      
      // 아이콘 유효성 검사
      setFieldValidation(prev => ({
        ...prev,
        icon: 'valid'
      }));
      setValidationErrors(prev => ({
        ...prev,
        icon: null
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

  const validateAllFields = () => {
    const errors = {};
    let hasErrors = false;
    
    // 필수 필드 검사
    const korTitleValidation = validateField('kor_title', formData.kor_title);
    const engTitleValidation = validateField('eng_title', formData.eng_title);
    const descriptionValidation = validateField('description', formData.description);
    const iconValidation = validateIcon();
    
    if (!korTitleValidation.isValid) {
      errors.kor_title = korTitleValidation.error;
      hasErrors = true;
    }
    
    if (!engTitleValidation.isValid) {
      errors.eng_title = engTitleValidation.error;
      hasErrors = true;
    }
    
    if (!descriptionValidation.isValid) {
      errors.description = descriptionValidation.error;
      hasErrors = true;
    }
    
    if (!iconValidation.isValid) {
      errors.icon = iconValidation.error;
      hasErrors = true;
    }
    
    setValidationErrors(errors);
    
    // 필드 상태 업데이트
    setFieldValidation({
      kor_title: korTitleValidation.isValid ? 'valid' : 'invalid',
      eng_title: engTitleValidation.isValid ? 'valid' : 'invalid',
      description: descriptionValidation.isValid ? 'valid' : 'invalid',
      icon: iconValidation.isValid ? 'valid' : 'invalid'
    });
    
    return !hasErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 전체 유효성 검사
    if (!validateAllFields()) {
      alert('입력값을 확인해주세요.');
      return;
    }
    
    if (idCheckStatus !== 'available') {
      alert('ID 확인을 먼저 해주세요.');
      return;
    }

    setLoading(true);
    let iconUrl = null;
    
    try {
      // 아이콘 업로드
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

      // 뱃지 생성
      const createData = {
        id: parseInt(formData.id),
        kor_title: formData.kor_title,
        eng_title: formData.eng_title,
        description: formData.description,
        icon: iconUrl,
        difficulty: parseInt(formData.difficulty),
        quest_ids: questList.map(quest => quest.quest_id)
      };

      const response = await axios.post(
        `http://localhost:8080/api/admin-quests/badges`,
        createData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Badge created successfully:', response.data);
      alert('뱃지가 성공적으로 생성되었습니다.');
      
      if (onSave) onSave();
      if (onClose) onClose();
      
    } catch (error) {
      console.error('Failed to create badge:', error);
      
      if (error.response && error.response.data && error.response.data.error) {
        alert(`뱃지 생성에 실패했습니다: ${error.response.data.error}`);
      } else {
        alert('뱃지 생성에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableQuests();
  }, []);

  return (
    <div className={styles.badgeCreateForm}>
      <div className={styles.header}>
        <h2 className={styles.title}>뱃지 생성</h2>
        <button className={styles.closeButton} onClick={onClose}>✕</button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 기본 정보 섹션 */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>기본 정보</h3>
          
          <div className={styles.basicInfo}>
            <div className={styles.leftColumn}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  ID <span className={styles.required}>*</span>
                  <span className={styles.idNote}>(생성 후 변경 불가)</span>
                </label>
                <div className={styles.idInputGroup}>
                  <input
                    type="number"
                    name="id"
                    value={formData.id}
                    onChange={handleInputChange}
                    className={`${styles.input} ${styles.idInput}`}
                    required
                    min="1"
                  />
                  <button
                    type="button"
                    className={styles.idCheckButton}
                    onClick={checkIdAvailability}
                    disabled={idCheckStatus === 'checking'}
                  >
                    {idCheckStatus === 'checking' ? '확인 중...' : 'ID 확인'}
                  </button>
                </div>
                {idCheckStatus === 'available' && (
                  <div className={styles.validationMessage}>
                    <span className={styles.validMessage}>✓ 사용 가능한 ID입니다</span>
                  </div>
                )}
                {idCheckStatus === 'unavailable' && (
                  <div className={styles.validationMessage}>
                    <span className={styles.invalidMessage}>✗ 이미 사용 중인 ID입니다</span>
                    {suggestedId && (
                      <span className={styles.suggestedMessage}>
                        추천 ID: {suggestedId}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  한국어 제목 <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="kor_title"
                  value={formData.kor_title}
                  onChange={handleInputChange}
                  className={`${styles.input} ${
                    fieldValidation.kor_title === 'valid' ? styles.validInput : 
                    fieldValidation.kor_title === 'invalid' ? styles.invalidInput : ''
                  }`}
                  required
                />
                {fieldValidation.kor_title === 'valid' && (
                  <div className={styles.validationMessage}>
                    <span className={styles.validMessage}>✓ 올바른 형식입니다</span>
                  </div>
                )}
                {fieldValidation.kor_title === 'invalid' && (
                  <div className={styles.validationMessage}>
                    <span className={styles.invalidMessage}>✗ {validationErrors.kor_title}</span>
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  영어 제목 <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="eng_title"
                  value={formData.eng_title}
                  onChange={handleInputChange}
                  className={`${styles.input} ${
                    fieldValidation.eng_title === 'valid' ? styles.validInput : 
                    fieldValidation.eng_title === 'invalid' ? styles.invalidInput : ''
                  }`}
                  required
                />
                {fieldValidation.eng_title === 'valid' && (
                  <div className={styles.validationMessage}>
                    <span className={styles.validMessage}>✓ 올바른 형식입니다</span>
                  </div>
                )}
                {fieldValidation.eng_title === 'invalid' && (
                  <div className={styles.validationMessage}>
                    <span className={styles.invalidMessage}>✗ {validationErrors.eng_title}</span>
                  </div>
                )}
              </div>

              <div className={`${styles.formGroup} ${styles.textareaGroup}`}>
                <label className={styles.label}>
                  설명 <span className={styles.required}>*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`${styles.textarea} ${
                    fieldValidation.description === 'valid' ? styles.validInput : 
                    fieldValidation.description === 'invalid' ? styles.invalidInput : ''
                  }`}
                  rows="4"
                  required
                />
                {fieldValidation.description === 'valid' && (
                  <div className={styles.validationMessage}>
                    <span className={styles.validMessage}>✓ 올바른 형식입니다</span>
                  </div>
                )}
                {fieldValidation.description === 'invalid' && (
                  <div className={styles.validationMessage}>
                    <span className={styles.invalidMessage}>✗ {validationErrors.description}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.rightColumn}>
              <div className={styles.iconUpload}>
                <label className={styles.label}>
                  아이콘 <span className={styles.required}>*</span>
                </label>
                <div 
                  className={`${styles.iconUploadArea} ${
                    fieldValidation.icon === 'valid' ? styles.validUpload : 
                    fieldValidation.icon === 'invalid' ? styles.invalidUpload : ''
                  }`} 
                  onClick={() => document.getElementById('iconFileInput').click()}
                >
                  {iconPreview ? (
                    <div className={styles.iconPreviewContainer}>
                      <img 
                        src={iconPreview} 
                        alt="Badge Icon Preview" 
                        className={styles.previewImage}
                      />
                      <div className={styles.iconOverlay}>
                        <span className={styles.iconChangeText}>클릭하여 변경</span>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.iconPlaceholder}>
                      <div className={styles.iconPlaceholderText}>
                        <span>+</span>
                        <span>아이콘 선택</span>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  id="iconFileInput"
                  type="file"
                  accept="image/*"
                  onChange={handleIconChange}
                  className={styles.hiddenFileInput}
                />
                <small className={styles.fileHint}>이미지 파일을 선택하세요</small>
                {fieldValidation.icon === 'valid' && (
                  <div className={styles.validationMessage}>
                    <span className={styles.validMessage}>✓ 아이콘이 선택되었습니다</span>
                  </div>
                )}
                {fieldValidation.icon === 'invalid' && (
                  <div className={styles.validationMessage}>
                    <span className={styles.invalidMessage}>✗ {validationErrors.icon}</span>
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  난이도 <span className={styles.required}>*</span>
                  <span className={styles.difficultyNote}>(생성 후 변경 불가)</span>
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className={styles.select}
                  required
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty.value} value={difficulty.value}>
                      {difficulty.label}
                    </option>
                  ))}
                </select>
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
          <button type="submit" className={styles.saveButton} disabled={loading}>
            {loading ? '생성 중...' : '생성'}
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

export default React.memo(BadgeCreateForm);