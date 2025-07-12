// QuestCreateForm.jsx
import React, { useState } from 'react';
import styles from './QuestCreateForm.module.css';
import API_ENDPOINTS from '../../utils/constants';
import api from '../../apis/api';

const QuestCreateForm = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: '',
    category: '1',
    title: '',
    description: '',
    quest_conditions: '',
    xp: '',
    is_seasonal: false,
    season_start: '',
    season_end: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [idCheckStatus, setIdCheckStatus] = useState(null); // null, 'checking', 'available', 'unavailable'
  const [suggestedId, setSuggestedId] = useState(null);
  
  // 유효성 검사 상태
  const [validationErrors, setValidationErrors] = useState({});
  const [fieldValidation, setFieldValidation] = useState({
    title: null,
    description: null,
    quest_conditions: null,
    xp: null,
    season_start: null,
    season_end: null
  });

  const categories = [
    { value: '1', label: '첫 발걸음' },
    { value: '2', label: '글쓰기/기록' },
    { value: '3', label: '음식/맛집' },
    { value: '4', label: '문화 체험' },
    { value: '5', label: '자연 체험' },
    { value: '6', label: '여행 생활' },
    { value: '7', label: '소통/공유' },
    { value: '8', label: '고난이도 도전' },
    { value: '9', label: '특수 조건' },
    { value: '10', label: '기간 제한' }
  ];

  // XP에 따른 난이도 계산
  const getDifficultyFromXP = (xp) => {
    const xpValue = parseInt(xp);
    if (xpValue < 150) return 'EASY';
    if (xpValue >= 150 && xpValue < 300) return 'MEDIUM';
    return 'HARD';
  };

  // 난이도 표시용 라벨
  const getDifficultyLabel = (xp) => {
    const difficulty = getDifficultyFromXP(xp);
    switch (difficulty) {
      case 'EASY': return 'Easy';
      case 'MEDIUM': return 'Normal';
      case 'HARD': return 'Hard';
      default: return '';
    }
  };

  // 유효성 검사 함수들
  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        if (!value.trim()) {
          return { isValid: false, error: '제목은 필수입니다' };
        } else if (value.length > 200) {
          return { isValid: false, error: '제목은 200자를 초과할 수 없습니다' };
        }
        return { isValid: true, error: null };
        
      case 'description':
        if (!value.trim()) {
          return { isValid: false, error: '설명은 필수입니다' };
        } else if (value.length > 500) {
          return { isValid: false, error: '설명은 500자를 초과할 수 없습니다' };
        }
        return { isValid: true, error: null };
        
      case 'quest_conditions':
        if (!value.trim()) {
          return { isValid: false, error: '퀘스트 조건은 필수입니다' };
        } else if (value.length > 500) {
          return { isValid: false, error: '퀘스트 조건은 500자를 초과할 수 없습니다' };
        }
        return { isValid: true, error: null };
        
      case 'xp':
        const xpValue = parseInt(value);
        if (!value.trim()) {
          return { isValid: false, error: 'XP는 필수입니다' };
        } else if (isNaN(xpValue) || xpValue <= 0) {
          return { isValid: false, error: 'XP는 양수여야 합니다' };
        } else if (xpValue > 10000) {
          return { isValid: false, error: 'XP는 10000을 초과할 수 없습니다' };
        }
        return { isValid: true, error: null };
        
      case 'season_start':
        if (formData.is_seasonal && !value.trim()) {
          return { isValid: false, error: '시즌 퀘스트는 시작일이 필수입니다' };
        }
        return { isValid: true, error: null };
        
      case 'season_end':
        if (formData.is_seasonal && !value.trim()) {
          return { isValid: false, error: '시즌 퀘스트는 종료일이 필수입니다' };
        }
        if (formData.is_seasonal && value && formData.season_start && new Date(value) <= new Date(formData.season_start)) {
          return { isValid: false, error: '종료일은 시작일보다 나중이어야 합니다' };
        }
        return { isValid: true, error: null };
        
      default:
        return { isValid: true, error: null };
    }
  };

  const checkIdAvailability = async () => {
    if (!formData.id) {
      alert('ID를 입력해주세요.');
      return;
    }

    setIdCheckStatus('checking');
    try {
      const response = await api.get(`${API_ENDPOINTS.QUEST.ADMIN}/quests/check-quest-id/${formData.id}`);
      
      if (response.data.available) {
        setIdCheckStatus('available');
        setSuggestedId(null);
        
      } else {
        setIdCheckStatus('unavailable');
        setSuggestedId(response.data.suggestedId);
        console.log(response.data.suggestedId);
      }
    } catch (err) {
      console.error("Failed to check ID availability", err);
      setIdCheckStatus('unavailable');
      setSuggestedId(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // ID가 변경되면 확인 상태 초기화
    if (name === 'id') {
      setIdCheckStatus(null);
      setSuggestedId(null);
    }
    
    // 시즌 체크박스가 해제되면 시즌 날짜 초기화
    if (name === 'is_seasonal' && !checked) {
      setFormData(prev => ({
        ...prev,
        season_start: '',
        season_end: ''
      }));
      setFieldValidation(prev => ({
        ...prev,
        season_start: null,
        season_end: null
      }));
      setValidationErrors(prev => ({
        ...prev,
        season_start: null,
        season_end: null
      }));
    }
    
    // 실시간 유효성 검사
    if (['title', 'description', 'quest_conditions', 'xp', 'season_start', 'season_end'].includes(name)) {
      const validation = validateField(name, newValue);
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

  const validateAllFields = () => {
    const errors = {};
    let hasErrors = false;
    
    // 필수 필드 검사
    const titleValidation = validateField('title', formData.title);
    const descriptionValidation = validateField('description', formData.description);
    const questConditionsValidation = validateField('quest_conditions', formData.quest_conditions);
    const xpValidation = validateField('xp', formData.xp);
    const seasonStartValidation = validateField('season_start', formData.season_start);
    const seasonEndValidation = validateField('season_end', formData.season_end);
    
    if (!titleValidation.isValid) {
      errors.title = titleValidation.error;
      hasErrors = true;
    }
    
    if (!descriptionValidation.isValid) {
      errors.description = descriptionValidation.error;
      hasErrors = true;
    }
    
    if (!questConditionsValidation.isValid) {
      errors.quest_conditions = questConditionsValidation.error;
      hasErrors = true;
    }
    
    if (!xpValidation.isValid) {
      errors.xp = xpValidation.error;
      hasErrors = true;
    }
    
    if (!seasonStartValidation.isValid) {
      errors.season_start = seasonStartValidation.error;
      hasErrors = true;
    }
    
    if (!seasonEndValidation.isValid) {
      errors.season_end = seasonEndValidation.error;
      hasErrors = true;
    }
    
    setValidationErrors(errors);
    
    // 필드 상태 업데이트
    setFieldValidation({
      title: titleValidation.isValid ? 'valid' : 'invalid',
      description: descriptionValidation.isValid ? 'valid' : 'invalid',
      quest_conditions: questConditionsValidation.isValid ? 'valid' : 'invalid',
      xp: xpValidation.isValid ? 'valid' : 'invalid',
      season_start: seasonStartValidation.isValid ? 'valid' : 'invalid',
      season_end: seasonEndValidation.isValid ? 'valid' : 'invalid'
    });
    
    return !hasErrors;
  };

  // 상태 계산
  const calculateStatus = () => {
    if (!formData.is_seasonal) return 'ACTIVE';
    
    const now = new Date();
    const start = new Date(formData.season_start);
    const end = new Date(formData.season_end);
    
    if (start > now || end < now) {
      return 'INACTIVE';
    }
    return 'ACTIVE';
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
    
    try {
      const difficulty = getDifficultyFromXP(formData.xp);
      const status = calculateStatus();
      
      // 설명과 조건을 합치기
      const combinedDescription = `${formData.description} ✅ 퀘스트 조건: ${formData.quest_conditions}`;
      
      const createData = {
        id: parseInt(formData.id),
        category: parseInt(formData.category),
        title: formData.title,
        description: combinedDescription,
        difficulty: difficulty,
        xp: parseInt(formData.xp),
        is_seasonal: formData.is_seasonal,
        season_start: formData.is_seasonal ? formData.season_start : null,
        season_end: formData.is_seasonal ? formData.season_end : null,
        status: status
      };

      const response = await api.post(
        `${API_ENDPOINTS.QUEST.ADMIN}/quests`,
        createData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Quest created successfully:', response.data);
      alert('퀘스트가 성공적으로 생성되었습니다.');
      
      if (onSave) onSave();
      if (onClose) onClose();
      
    } catch (error) {
      console.error('Failed to create quest:', error);
      
      if (error.response && error.response.data && error.response.data.error) {
        alert(`퀘스트 생성에 실패했습니다: ${error.response.data.error}`);
      } else {
        alert('퀘스트 생성에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.questCreateForm}>
      <div className={styles.header}>
        <h2 className={styles.title}>퀘스트 생성</h2>
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
                  카테고리 <span className={styles.required}>*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={styles.select}
                  required
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  제목 <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`${styles.input} ${
                    fieldValidation.title === 'valid' ? styles.validInput : 
                    fieldValidation.title === 'invalid' ? styles.invalidInput : ''
                  }`}
                  required
                />
                {fieldValidation.title === 'valid' && (
                  <div className={styles.validationMessage}>
                    <span className={styles.validMessage}>✓ 올바른 형식입니다</span>
                  </div>
                )}
                {fieldValidation.title === 'invalid' && (
                  <div className={styles.validationMessage}>
                    <span className={styles.invalidMessage}>✗ {validationErrors.title}</span>
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  XP <span className={styles.required}>*</span>
                  {formData.xp && (
                    <span className={styles.difficultyPreview}>
                      ({getDifficultyLabel(formData.xp)})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  name="xp"
                  value={formData.xp}
                  onChange={handleInputChange}
                  className={`${styles.input} ${
                    fieldValidation.xp === 'valid' ? styles.validInput : 
                    fieldValidation.xp === 'invalid' ? styles.invalidInput : ''
                  }`}
                  required
                  min="1"
                  max="10000"
                />
                <small className={styles.xpHint}>
                  150 XP 미만: Easy, 150-299 XP: Normal, 300 XP 이상: Hard
                </small>
                {fieldValidation.xp === 'valid' && (
                  <div className={styles.validationMessage}>
                    <span className={styles.validMessage}>✓ 올바른 형식입니다</span>
                  </div>
                )}
                {fieldValidation.xp === 'invalid' && (
                  <div className={styles.validationMessage}>
                    <span className={styles.invalidMessage}>✗ {validationErrors.xp}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.rightColumn}>
              <div className={`${styles.formGroup} ${styles.textareaGroup}`}>
                <label className={styles.label}>
                  퀘스트 설명 <span className={styles.required}>*</span>
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
                  placeholder="퀘스트에 대한 전반적인 설명을 입력하세요..."
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

              <div className={`${styles.formGroup} ${styles.textareaGroup}`}>
                <label className={styles.label}>
                  퀘스트 조건 <span className={styles.required}>*</span>
                </label>
                <textarea
                  name="quest_conditions"
                  value={formData.quest_conditions}
                  onChange={handleInputChange}
                  className={`${styles.textarea} ${
                    fieldValidation.quest_conditions === 'valid' ? styles.validInput : 
                    fieldValidation.quest_conditions === 'invalid' ? styles.invalidInput : ''
                  }`}
                  rows="4"
                  placeholder="퀘스트 완료를 위한 구체적인 조건들을 입력하세요..."
                  required
                />
                {fieldValidation.quest_conditions === 'valid' && (
                  <div className={styles.validationMessage}>
                    <span className={styles.validMessage}>✓ 올바른 형식입니다</span>
                  </div>
                )}
                {fieldValidation.quest_conditions === 'invalid' && (
                  <div className={styles.validationMessage}>
                    <span className={styles.invalidMessage}>✗ {validationErrors.quest_conditions}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 시즌 설정 섹션 */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>시즌 설정</h3>
          
          <div className={styles.seasonalSection}>
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="is_seasonal"
                  checked={formData.is_seasonal}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>시즌 퀘스트로 설정</span>
              </label>
            </div>

            {formData.is_seasonal && (
              <div className={styles.seasonDates}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    시작일 <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="season_start"
                    value={formData.season_start}
                    onChange={handleInputChange}
                    className={`${styles.input} ${
                      fieldValidation.season_start === 'valid' ? styles.validInput : 
                      fieldValidation.season_start === 'invalid' ? styles.invalidInput : ''
                    }`}
                    required={formData.is_seasonal}
                  />
                  {fieldValidation.season_start === 'valid' && (
                    <div className={styles.validationMessage}>
                      <span className={styles.validMessage}>✓ 올바른 형식입니다</span>
                    </div>
                  )}
                  {fieldValidation.season_start === 'invalid' && (
                    <div className={styles.validationMessage}>
                      <span className={styles.invalidMessage}>✗ {validationErrors.season_start}</span>
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    종료일 <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="season_end"
                    value={formData.season_end}
                    onChange={handleInputChange}
                    className={`${styles.input} ${
                      fieldValidation.season_end === 'valid' ? styles.validInput : 
                      fieldValidation.season_end === 'invalid' ? styles.invalidInput : ''
                    }`}
                    required={formData.is_seasonal}
                  />
                  {fieldValidation.season_end === 'valid' && (
                    <div className={styles.validationMessage}>
                      <span className={styles.validMessage}>✓ 올바른 형식입니다</span>
                    </div>
                  )}
                  {fieldValidation.season_end === 'invalid' && (
                    <div className={styles.validationMessage}>
                      <span className={styles.invalidMessage}>✗ {validationErrors.season_end}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 상태 미리보기 */}
            <div className={styles.statusPreview}>
              <label className={styles.label}>예상 상태</label>
              <span className={`${styles.statusTag} ${styles[calculateStatus().toLowerCase()]}`}>
                {calculateStatus()}
              </span>
              {formData.is_seasonal && (
                <small className={styles.statusHint}>
                  시작일이 미래이거나 종료일이 과거일 경우 INACTIVE 상태가 됩니다
                </small>
              )}
            </div>
          </div>
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
    </div>
  );
};

export default React.memo(QuestCreateForm);