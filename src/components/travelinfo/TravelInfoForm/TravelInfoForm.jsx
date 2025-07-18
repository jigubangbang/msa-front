import React, { useState, useEffect, useRef } from 'react';
import styles from './TravelInfoForm.module.css';
import api from '../../../apis/api';
import API_ENDPOINTS from '../../../utils/constants';
import ConfirmModal from '../../common/ErrorModal/ConfirmModal';

const TravelInfoForm = ({ mode = 'create', initialData = null, onSubmit, onClose }) => {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmType, setConfirmType] = useState('alert');
  const [confirmAction, setConfirmAction] = useState(null);

  // 파일 유효성 검사 함수 추가
  const validateFile = (file) => {
    const errors = [];
    
    // 파일 크기 검사
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`파일 크기는 ${MAX_FILE_SIZE / (1024 * 1024)}MB를 초과할 수 없습니다.`);
    }
    
    // 파일 타입 검사
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      errors.push('지원되는 형식: JPG, PNG, WebP');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // 파일 크기 포맷팅 함수 추가
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const showAlertModal = (message) => {
    setConfirmMessage(message);
    setConfirmType('alert');
    setConfirmAction(null);
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

  const [formData, setFormData] = useState({
    title: '',
    simpleDescription: '',
    enterDescription: '',
    thumbnailImage: null,
    themes: []
  });

  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [selectedThemes, setSelectedThemes] = useState([]);

  const themeRef = useRef(null);

  // 유효성 검사 상태
  const [validationErrors, setValidationErrors] = useState({});
  const [fieldValidation, setFieldValidation] = useState({
    title: null,
    simpleDescription: null,
    enterDescription: null,
    thumbnailImage: null
  });

  // 정보방 카테고리 정의
  const themes = [
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

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (themeRef.current && !themeRef.current.contains(event.target)) {
        setShowThemeDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // 초기 데이터 설정 (수정 모드일 때)
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        title: initialData.title || '',
        simpleDescription: initialData.simpleDescription || '',
        enterDescription: initialData.enterDescription || '',
        thumbnailImage: null,
        themes: initialData.themeIds || []
      });

      if (initialData.thumbnailImage) {
        setThumbnailPreview(initialData.thumbnailImage);
      }

      if (initialData.themeIds) {
        const selectedThemeObjects = themes.filter(theme => 
          initialData.themeIds.includes(theme.id)
        );
        setSelectedThemes(selectedThemeObjects);
      }
    }
  }, [mode, initialData]);

  // 유효성 검사 함수들
  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        if (!value.trim()) {
          return { isValid: false, error: '정보방 제목은 필수입니다' };
        } else if (value.length > 100) {
          return { isValid: false, error: '정보방 제목은 100자를 초과할 수 없습니다' };
        }
        return { isValid: true, error: null };
        
      case 'simpleDescription':
        if (!value.trim()) {
          return { isValid: false, error: '정보방 설명은 필수입니다' };
        } else if (value.length > 500) {
          return { isValid: false, error: '정보방 설명은 500자를 초과할 수 없습니다' };
        }
        return { isValid: true, error: null };
        
      case 'enterDescription':
        if (!value.trim()) {
          return { isValid: false, error: '참여 안내 메시지는 필수입니다' };
        } else if (value.length > 1000) {
          return { isValid: false, error: '참여 안내 메시지는 1000자를 초과할 수 없습니다' };
        }
        return { isValid: true, error: null };
        
      default:
        return { isValid: true, error: null };
    }
  };

  const validateImages = () => {
    const errors = {};
    
    if (!thumbnailPreview) {
      errors.thumbnailImage = '썸네일 이미지는 필수입니다';
    }
    
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 실시간 유효성 검사
    if (['title', 'simpleDescription', 'enterDescription'].includes(name)) {
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

  const handleThumbnailImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validation = validateFile(file);
      
      if (!validation.isValid) {
        // 유효성 검사 실패
        setFieldValidation(prev => ({
          ...prev,
          thumbnailImage: 'invalid'
        }));
        setValidationErrors(prev => ({
          ...prev,
          thumbnailImage: validation.errors.join(' ')
        }));
        
        // 파일 input 초기화
        e.target.value = '';
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        thumbnailImage: file
      }));
      
      // 유효성 검사
      setFieldValidation(prev => ({
        ...prev,
        thumbnailImage: 'valid'
      }));
      setValidationErrors(prev => ({
        ...prev,
        thumbnailImage: null
      }));
      
      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThemeSelect = (theme) => {
    const isAlreadySelected = selectedThemes.some(selected => selected.id === theme.id);
    
    if (!isAlreadySelected) {
      const updatedThemes = [...selectedThemes, theme];
      setSelectedThemes(updatedThemes);
      setFormData(prev => ({
        ...prev,
        themes: updatedThemes.map(t => t.id)
      }));
    }
    setShowThemeDropdown(false);
  };

  const removeTheme = (themeId) => {
    const updatedThemes = selectedThemes.filter(theme => theme.id !== themeId);
    setSelectedThemes(updatedThemes);
    setFormData(prev => ({
      ...prev,
      themes: updatedThemes.map(t => t.id)
    }));
  };

  const resetThemes = () => {
    setSelectedThemes([]);
    setFormData(prev => ({
      ...prev,
      themes: []
    }));
  };

  const uploadImage = async (file, type) => {
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    
    const response = await api.post(
      `${API_ENDPOINTS.COMMUNITY.PUBLIC}/upload-image/${type}`,
      uploadFormData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data.imageUrl;
  };

  const validateAllFields = () => {
    const errors = {};
    let hasErrors = false;
    
    // 텍스트 필드 검사
    const titleValidation = validateField('title', formData.title);
    const simpleDescValidation = validateField('simpleDescription', formData.simpleDescription);
    const enterDescValidation = validateField('enterDescription', formData.enterDescription);
    
    if (!titleValidation.isValid) {
      errors.title = titleValidation.error;
      hasErrors = true;
    }
    
    if (!simpleDescValidation.isValid) {
      errors.simpleDescription = simpleDescValidation.error;
      hasErrors = true;
    }
    
    if (!enterDescValidation.isValid) {
      errors.enterDescription = enterDescValidation.error;
      hasErrors = true;
    }
    
    // 이미지 검사
    const imageErrors = validateImages();
    Object.assign(errors, imageErrors);
    if (Object.keys(imageErrors).length > 0) {
      hasErrors = true;
    }
    
    // 테마 검사
    if (selectedThemes.length === 0) {
      errors.themes = '최소 1개의 카테고리를 선택해야 합니다';
      hasErrors = true;
    }
    
    setValidationErrors(errors);
    
    // 필드 상태 업데이트
    setFieldValidation({
      title: titleValidation.isValid ? 'valid' : 'invalid',
      simpleDescription: simpleDescValidation.isValid ? 'valid' : 'invalid',
      enterDescription: enterDescValidation.isValid ? 'valid' : 'invalid',
      thumbnailImage: thumbnailPreview ? 'valid' : 'invalid'
    });
    
    return !hasErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 전체 유효성 검사
    if (!validateAllFields()) {
      showAlertModal('입력값을 확인해주세요.');
      return;
    }

    setLoading(true);
    
    try {
      let thumbnailImageUrl = thumbnailPreview;
      
      // 새로운 이미지가 있으면 업로드
      if (formData.thumbnailImage) {
        thumbnailImageUrl = await uploadImage(formData.thumbnailImage, 'travelinfo');
      }

      // 제출 데이터 구성
      const submitData = {
        title: formData.title,
        simpleDescription: formData.simpleDescription,
        enterDescription: formData.enterDescription,
        thumbnailImage: thumbnailImageUrl,
        themeIds: formData.themes
      };

      await onSubmit(submitData);
      
    } catch (error) {
      console.error('Failed to submit form:', error);
      showAlertModal('정보방 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.travelInfoForm}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {mode === 'create' ? '정보방 생성' : '정보방 수정'}
        </h2>
        <button className={styles.closeButton} onClick={onClose}>✕</button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 기본 정보 섹션 - 제목/설명과 썸네일 이미지 */}
        <div className={styles.basicInfoSection}>
          <div className={styles.leftColumn}>
            <div className={styles.formGroup}>
              <label className={styles.label}>정보방 제목</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`${styles.input} ${
                  fieldValidation.title === 'valid' ? styles.validInput : 
                  fieldValidation.title === 'invalid' ? styles.invalidInput : ''
                }`}
                placeholder="정보방 제목을 입력하세요"
                required
              />
              {validationErrors.title && (
                <div className={styles.errorMessage}>{validationErrors.title}</div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>정보방 설명</label>
              <textarea
                name="simpleDescription"
                value={formData.simpleDescription}
                onChange={handleInputChange}
                className={`${styles.textarea} ${
                  fieldValidation.simpleDescription === 'valid' ? styles.validInput : 
                  fieldValidation.simpleDescription === 'invalid' ? styles.invalidInput : ''
                }`}
                placeholder="정보방에 대한 간단한 설명을 작성해주세요"
                rows="4"
                required
              />
              {validationErrors.simpleDescription && (
                <div className={styles.errorMessage}>{validationErrors.simpleDescription}</div>
              )}
            </div>
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.thumbnailUpload}>
              <label className={styles.label}>썸네일 이미지</label>
              <div 
                className={`${styles.thumbnailImageUpload} ${
                  fieldValidation.thumbnailImage === 'invalid' ? styles.invalidUpload : ''
                }`}
                onClick={() => document.getElementById('thumbnailImageInput').click()}
              >
                {thumbnailPreview ? (
                  <div className={styles.thumbnailPreview}>
                    <img 
                      src={thumbnailPreview} 
                      alt="Thumbnail Preview" 
                      className={styles.thumbnailImage}
                    />
                    <div className={styles.thumbnailOverlay}>
                      <span className={styles.changeText}>썸네일 변경</span>
                    </div>
                  </div>
                ) : (
                  <div className={styles.thumbnailPlaceholder}>
                    <span className={styles.placeholderText}>썸네일 선택</span>
                  </div>
                )}
              </div>
              <input
                id="thumbnailImageInput"
                type="file"
                accept="image/*"
                onChange={handleThumbnailImageChange}
                className={styles.hiddenFileInput}
              />
              {validationErrors.thumbnailImage && (
                <div className={styles.errorMessage}>{validationErrors.thumbnailImage}</div>
              )}
            </div>
          </div>
        </div>

        {/* 카테고리 선택 섹션 */}
        <div className={styles.fullWidthSection}>
          <div className={styles.sectionHeader}>
            <label className={styles.sectionLabel}>정보방 카테고리</label>
            <div className={styles.currentInfo}>
              {selectedThemes.map(theme => (
                <span key={theme.id} className={styles.currentTag}>
                  {theme.label}
                </span>
              ))}
            </div>
          </div>
          
          <div className={styles.themeSelector}>
            <div className={styles.row}>
              <div className={styles.column}>
                <div className={styles.formGroup}>
                  <div ref={themeRef} className={styles.dropdown}>
                    <div 
                      className={styles.dropdownButton}
                      onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                    >
                      카테고리 추가
                      <span className={styles.arrow}>▼</span>
                    </div>
                    {showThemeDropdown && (
                      <div className={styles.themeList}>
                        {themes.filter(theme => 
                          !selectedThemes.some(selected => selected.id === theme.id)
                        ).map(theme => (
                          <div
                            key={theme.id}
                            className={styles.themeItem}
                            onClick={() => handleThemeSelect(theme)}
                          >
                            {theme.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.addedSection}>
              {selectedThemes.length > 0 && (
                <button type="button" className={styles.resetButton} onClick={resetThemes}>
                  <img src="/icons/common/refresh.svg" alt="refresh"/>
                </button>
              )}

              <div className={styles.addedThemes}>
                {selectedThemes.map(theme => (
                  <div key={theme.id} className={styles.themeTag}>
                    {theme.label}
                    <button 
                      type="button"
                      className={styles.btn + ' ' + styles.btnOutline}
                      onClick={() => removeTheme(theme.id)}
                    >
                      <img src="/icons/common/close.svg" alt="close"/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {validationErrors.themes && (
            <div className={styles.errorMessage}>{validationErrors.themes}</div>
          )}
        </div>

        {/* 참여 안내 메시지 */}
        <div className={styles.fullWidthSection}>
          <h3 className={styles.sectionTitle}>참여 안내 메시지</h3>
          <textarea
            name="enterDescription"
            value={formData.enterDescription}
            onChange={handleInputChange}
            className={`${styles.textarea} ${
              fieldValidation.enterDescription === 'valid' ? styles.validInput : 
              fieldValidation.enterDescription === 'invalid' ? styles.invalidInput : ''
            }`}
            placeholder="정보방 참여자에게 전달할 안내 메시지를 작성해주세요"
            rows="6"
            required
          />
          {validationErrors.enterDescription && (
            <div className={styles.errorMessage}>{validationErrors.enterDescription}</div>
          )}
        </div>

        {/* 제출 버튼 */}
        <div className={styles.actions}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            취소
          </button>
          <button type="submit" className={styles.saveButton} disabled={loading}>
            {loading ? '저장 중...' : mode === 'create' ? '정보방 생성' : '정보방 수정'}
          </button>
        </div>
      </form>

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

export default TravelInfoForm;