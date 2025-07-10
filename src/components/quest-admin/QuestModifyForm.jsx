// QuestModifyForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './QuestModifyForm.module.css';
import API_ENDPOINTS from '../../utils/constants';

const QuestModifyForm = ({ questId, onClose, onSave }) => {
  const [questData, setQuestData] = useState(null);
  const [formData, setFormData] = useState({
    category: '1',
    title: '',
    description: '',
    quest_conditions: '',
    xp: '',
    is_seasonal: false,
    season_start: '',
    season_end: ''
  });
  const [badgeList, setBadgeList] = useState([]);
  const [loading, setLoading] = useState(false);
  
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16);
    } catch (error) {
      return '';
    }
  };

  const parseDescription = (description) => {
    if (!description) return { description: '', quest_conditions: '' };
    
    const parts = description.split('✅ 퀘스트 조건:');
    return {
      description: parts[0]?.trim() || '',
      quest_conditions: parts[1]?.trim() || ''
    };
  };

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

  const fetchQuestData = async () => {
    setLoading(true);
    try {
      // 퀘스트 상세 정보 가져오기
      const questResponse = await axios.get(`${API_ENDPOINTS.QUEST.ADMIN}/detail/${questId}`);
      const questDetail = questResponse.data.questDetail;
      
      // 퀘스트 뱃지 정보 가져오기
      const badgesResponse = await axios.get(`${API_ENDPOINTS.QUEST.ADMIN}/detail/${questId}/badges`);
      const questBadges = badgesResponse.data.questBadges;
      
      setQuestData(questDetail);
      setBadgeList(questBadges);
      
      // 설명과 조건 분리
      const { description, quest_conditions } = parseDescription(questDetail.description);
      
      // 카테고리 값 찾기
      const categoryValue = categories.find(cat => cat.label === questDetail.category)?.value || '1';
      
      setFormData({
        category: categoryValue,
        title: questDetail.title,
        description: description,
        quest_conditions: quest_conditions,
        xp: questDetail.xp.toString(),
        is_seasonal: questDetail.is_seasonal,
        season_start: formatDate(questDetail.season_start),
        season_end: formatDate(questDetail.season_end)
      });
      
    } catch (err) {
      console.error("Failed to fetch quest data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
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

    setLoading(true);
    
    try {
      const difficulty = getDifficultyFromXP(formData.xp);
      const status = calculateStatus();
      
      // 설명과 조건을 합치기
      const combinedDescription = `${formData.description} ✅ 퀘스트 조건: ${formData.quest_conditions}`;
      
      const updateData = {
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

      const response = await axios.put(
        `${API_ENDPOINTS.QUEST.ADMIN}/quests/${questId}`,
        updateData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Quest updated successfully:', response.data);
      alert('퀘스트가 성공적으로 수정되었습니다.');
      
      if (onSave) onSave();
      if (onClose) onClose();
      
    } catch (error) {
      console.error('Failed to update quest:', error);
      
      if (error.response && error.response.data && error.response.data.error) {
        alert(`퀘스트 수정에 실패했습니다: ${error.response.data.error}`);
      } else {
        alert('퀘스트 수정에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (questId) {
      fetchQuestData();
    }
  }, [questId]);

  if (loading && !questData) {
    return (
      <div className={styles.questModifyForm}>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  if (!questData) {
    return (
      <div className={styles.questModifyForm}>
        <div className={styles.error}>퀘스트 정보를 불러올 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className={styles.questModifyForm}>
      <div className={styles.header}>
        <h2 className={styles.title}>퀘스트 수정</h2>
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
                  ID
                  <span className={styles.idNote}>(수정 불가)</span>
                </label>
                <input
                  type="text"
                  value={questData.quest_id}
                  className={`${styles.input} ${styles.disabledInput}`}
                  disabled
                />
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

          {/* 퀘스트 통계 정보 */}
          <div className={styles.questStats}>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>생성일</span>
                <span className={styles.statValue}>{new Date(questData.created_at).toLocaleDateString()}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>완료자 수</span>
                <span className={styles.statCompletedValue}>{questData.count_completed}명</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>진행 중</span>
                <span className={styles.statInProgressValue}>{questData.count_in_progress}명</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>포기자 수</span>
                <span className={styles.statGivenUpValue}>{questData.count_given_up}명</span>
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

        {/* 연결된 뱃지 섹션 */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>연결된 뱃지 ({badgeList.length}개)</h3>

          {badgeList.length > 0 ? (
            <div className={styles.badgeGrid}>
              {badgeList.map(badge => (
                <div key={badge.badge_id} className={styles.badgeCard}>
                  <img 
                    src={badge.icon} 
                    alt={badge.kor_title}
                    className={styles.badgeIcon}
                  />
                  <div className={styles.badgeInfo}>
                    <h4 className={styles.badgeTitle}>{badge.kor_title}</h4>
                    <p className={styles.badgeSubtitle}>{badge.eng_title}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noBadges}>연결된 뱃지가 없습니다.</div>
          )}
        </div>

        {/* 제출 버튼 */}
        <div className={styles.actions}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            취소
          </button>
          <button type="submit" className={styles.saveButton} disabled={loading}>
            {loading ? '수정 중...' : '수정'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default React.memo(QuestModifyForm);