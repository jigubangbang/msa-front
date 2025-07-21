import React, { useState, useEffect, useCallback } from 'react';
import styles from './TravelmateForm.module.css';
import TravelmateFilter from '../TravelmateFilter/TravelmateFilter';
import DateSelector from '../DateSelector/DateSelector';
import api from '../../../apis/api';
import API_ENDPOINTS from '../../../utils/constants';
import ConfirmModal from '../../common/ErrorModal/ConfirmModal';
import { Circles } from "react-loader-spinner";

const TravelmateForm = ({ mode = 'create', initialData = null, onSubmit, onClose }) => {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmType, setConfirmType] = useState('alert');
  const [confirmAction, setConfirmAction] = useState(null);
  const [dateReset, setDateReset] = useState(false);


  const handleDateReset = () => {
    setDateData({
      startDate: null,
      endDate: null
    });
    setDateReset(true);
    setTimeout(() => setDateReset(false), 100);
  };

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


  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const [formData, setFormData] = useState({
    title: '',
    simpleDescription: '',
    description: '',
    applicationDescription: '',
    backgroundImage: null,
    thumbnailImage: null,
    // 필터 관련 데이터
    locations: [],
    targets: [],
    themes: [],
    styles: []
  });

  const [dateData, setDateData] = useState({
    startDate: null,
    endDate: null
  });

  const [displayFilters, setDisplayFilters] = useState({
  locationNames: '',
  targetNames: '',
  themeNames: '',
  styleNames: ''
});

  const [backgroundPreview, setBackgroundPreview] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [loading, setLoading] = useState(false);

  // 유효성 검사 상태
  const [validationErrors, setValidationErrors] = useState({});
  const [fieldValidation, setFieldValidation] = useState({
    title: null,
    simpleDescription: null,
    description: null,
    applicationDescription: null,
    backgroundImage: null,
    thumbnailImage: null
  });

  // 초기 데이터 설정 (수정 모드일 때)
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        title: initialData.title || '',
        simpleDescription: initialData.simpleDescription || '',
        description: initialData.description || '',
        applicationDescription: initialData.applicationDescription || '',
        backgroundImage: null,
        thumbnailImage: null,
        locations: initialData.locations || [],
        targets: initialData.targets || [],
        themes: initialData.themes || [],
        styles: initialData.styles || []
      });

      setDisplayFilters({
      locationNames: initialData.locationNames || '',
      targetNames: initialData.targetNames || '',
      themeNames: initialData.themeNames || '',
      styleNames: initialData.styleNames || ''
    });

      if (initialData.backgroundImage) {
        setBackgroundPreview(initialData.backgroundImage);
      }
      if (initialData.thumbnailImage) {
        setThumbnailPreview(initialData.thumbnailImage);
      }

      if (initialData.startAt && initialData.endAt) {
        const startDate = new Date(initialData.startAt);
        const endDate = new Date(initialData.endAt);
        setDateData({
          startDate: {
            year: startDate.getFullYear(),
            month: startDate.getMonth() + 1,
            day: startDate.getDate(),
            dateString: initialData.startAt.split('T')[0]
          },
          endDate: {
            year: endDate.getFullYear(),
            month: endDate.getMonth() + 1,
            day: endDate.getDate(),
            dateString: initialData.endAt.split('T')[0]
          }
        });
      }
    }
  }, [mode, initialData]);

  // 유효성 검사 함수들
  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        if (!value.trim()) {
          return { isValid: false, error: '모임 제목은 필수입니다' };
        } else if (value.length > 100) {
          return { isValid: false, error: '모임 제목은 100자를 초과할 수 없습니다' };
        }
        return { isValid: true, error: null };
        
      case 'simpleDescription':
        if (!value.trim()) {
          return { isValid: false, error: '모임 한마디는 필수입니다' };
        } else if (value.length > 200) {
          return { isValid: false, error: '모임 한마디는 200자를 초과할 수 없습니다' };
        }
        return { isValid: true, error: null };
        
      case 'description':
        if (!value.trim()) {
          return { isValid: false, error: '모임 설명은 필수입니다' };
        } else if (value.length > 2000) {
          return { isValid: false, error: '모임 설명은 2000자를 초과할 수 없습니다' };
        }
        return { isValid: true, error: null };
        
      case 'applicationDescription':
        if (!value.trim()) {
          return { isValid: false, error: '모임 신청 안내 메시지는 필수입니다' };
        } else if (value.length > 1000) {
          return { isValid: false, error: '모임 신청 안내 메시지는 1000자를 초과할 수 없습니다' };
        }
        return { isValid: true, error: null };
        
      default:
        return { isValid: true, error: null };
    }
  };

  const validateImages = () => {
    const errors = {};
    
    if (!backgroundPreview) {
      errors.backgroundImage = '배경 이미지는 필수입니다';
    }
    
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
    if (['title', 'simpleDescription', 'description', 'applicationDescription'].includes(name)) {
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

  const handleBackgroundImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validation = validateFile(file);
    
    if (!validation.isValid) {
      setFieldValidation(prev => ({
        ...prev,
        backgroundImage: 'invalid'
      }));
      setValidationErrors(prev => ({
        ...prev,
        backgroundImage: validation.errors.join(' ')
      }));

      e.target.value = '';
      return;
    }

      setFormData(prev => ({
        ...prev,
        backgroundImage: file
      }));
      
      // 유효성 검사
      setFieldValidation(prev => ({
        ...prev,
        backgroundImage: 'valid'
      }));
      setValidationErrors(prev => ({
        ...prev,
        backgroundImage: null
      }));
      
      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThumbnailImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // 파일 유효성 검사
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

  const handleFilterSubmit = (filters) => {
    setFormData(prev => ({
      ...prev,
      ...filters
    }));

    setDisplayFilters({
        locationNames: filters.locations?.map(loc => `${loc.country?.name} ${loc.city?.cityName}`).join(', ') || '',
        targetNames: filters.targets?.map(target => target.label).join(', ') || '',
        themeNames: filters.themes?.map(theme => theme.label).join(', ') || '',
        styleNames: filters.styles?.map(style => style.label).join(', ') || ''
    });
  };

  const handleDateSubmit = useCallback((dates) => {
    setDateData(dates);
  }, []);

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
    const descValidation = validateField('description', formData.description);
    const appDescValidation = validateField('applicationDescription', formData.applicationDescription);
    
    if (!titleValidation.isValid) {
      errors.title = titleValidation.error;
      hasErrors = true;
    }
    
    if (!simpleDescValidation.isValid) {
      errors.simpleDescription = simpleDescValidation.error;
      hasErrors = true;
    }
    
    if (!descValidation.isValid) {
      errors.description = descValidation.error;
      hasErrors = true;
    }
    
    if (!appDescValidation.isValid) {
      errors.applicationDescription = appDescValidation.error;
      hasErrors = true;
    }
    
    // 이미지 검사
    const imageErrors = validateImages();
    Object.assign(errors, imageErrors);
    if (Object.keys(imageErrors).length > 0) {
      hasErrors = true;
    }
    
    // 날짜 검사
    if (!dateData.startDate || !dateData.endDate) {
      errors.dates = '여행 기간은 필수입니다';
      hasErrors = true;
    }
    
    // 필터 검사
    if (formData.locations.length === 0) {
      errors.locations = '지역은 최소 1개 이상 선택해야 합니다';
      hasErrors = true;
    }
    
    setValidationErrors(errors);
    
    // 필드 상태 업데이트
    setFieldValidation({
      title: titleValidation.isValid ? 'valid' : 'invalid',
      simpleDescription: simpleDescValidation.isValid ? 'valid' : 'invalid',
      description: descValidation.isValid ? 'valid' : 'invalid',
      applicationDescription: appDescValidation.isValid ? 'valid' : 'invalid',
      backgroundImage: backgroundPreview ? 'valid' : 'invalid',
      thumbnailImage: thumbnailPreview ? 'valid' : 'invalid'
    });
    
    return !hasErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 전체 유효성 검사
    if (!validateAllFields()) {
      showAlertModal('입력값을 확인해주세요');
      return;
    }

    setLoading(true);
    
    try {
      let backgroundImageUrl = backgroundPreview;
      let thumbnailImageUrl = thumbnailPreview;
      
      // 새로운 이미지가 있으면 업로드
      if (formData.backgroundImage) {
        backgroundImageUrl = await uploadImage(formData.backgroundImage, 'travelmate');
      }
      
      if (formData.thumbnailImage) {
        thumbnailImageUrl = await uploadImage(formData.thumbnailImage, 'travelmate');
      }

      // 제출 데이터 구성
      const submitData = {
        title: formData.title,
        simpleDescription: formData.simpleDescription,
        description: formData.description,
        applicationDescription: formData.applicationDescription,
        backgroundImage: backgroundImageUrl,
        thumbnailImage: thumbnailImageUrl,
        startAt: dateData.startDate.dateString,
        endAt: dateData.endDate.dateString,
        locationIds: formData.locations.map(location => location.id),
        targetIds: formData.targets.map(target => target.id),
        themeIds: formData.themes.map(theme => theme.id),
        styleIds: formData.styles.map(style => style.id)
      };

      await onSubmit(submitData);
      
    } catch (error) {
      console.error('Failed to submit form:', error);
      showAlertModal('모임 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.travelmateForm}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {mode === 'create' ? '여행자 모임 생성' : '여행자 모임 수정'}
        </h2>
        <button className={styles.closeButton} onClick={onClose}>✕</button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 배경 이미지 업로드 */}
        <div className={styles.backgroundImageSection}>
          <div 
            className={`${styles.backgroundImageUpload} ${
              fieldValidation.backgroundImage === 'invalid' ? styles.invalidUpload : ''
            }`}
            onClick={() => document.getElementById('backgroundImageInput').click()}
          >
            {backgroundPreview ? (
              <div className={styles.backgroundPreview}>
                <img 
                  src={backgroundPreview} 
                  alt="Background Preview" 
                  className={styles.backgroundImage}
                />
                <div className={styles.backgroundOverlay}>
                  <span className={styles.changeText}>이미지 찾아보기</span>
                </div>
              </div>
            ) : (
              <div className={styles.backgroundPlaceholder}>
                <span className={styles.placeholderText}>이미지 찾아보기</span>
              </div>
            )}
          </div>
          <input
            id="backgroundImageInput"
            type="file"
            accept="image/*"
            onChange={handleBackgroundImageChange}
            className={styles.hiddenFileInput}
          />
          {validationErrors.backgroundImage && (
            <div className={`${styles.message} ${styles.errorMessage}`}>{validationErrors.backgroundImage}</div>
          )}
        </div>

        {/* 기본 정보 섹션 - 제목/한마디와 썸네일 이미지 */}
        <div className={styles.basicInfoSection}>
          <div className={styles.leftColumn}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                모임 제목<span className={styles.required}>*</span>
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
                placeholder="모임 제목을 작성해주세요"
                required
              />
              {validationErrors.title && (
                <div className={styles.errorMessage}>{validationErrors.title}</div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                모임 한마디 <span className={styles.required}>*</span>
              </label>
              <textarea
                name="simpleDescription"
                value={formData.simpleDescription}
                onChange={handleInputChange}
                className={`${styles.input} ${
                  fieldValidation.simpleDescription === 'valid' ? styles.validInput : 
                  fieldValidation.simpleDescription === 'invalid' ? styles.invalidInput : ''
                }`}
                placeholder="모임을 한마디로 표현해 보세요"
                rows={2}
                required
              />
              {validationErrors.simpleDescription && (
                <div className={styles.errorMessage}>{validationErrors.simpleDescription}</div>
              )}
            </div>
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.thumbnailUpload}>
              <label className={styles.label}>
                썸네일 이미지 <span className={styles.required}>*</span>
              </label>
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

        {/* 모임 카테고리 - 전체 너비 */}
        <div className={styles.fullWidthSection}>
        <div className={styles.sectionHeader}>
            <label className={styles.sectionLabel}>모임 카테고리 <span className={styles.required}>*</span></label>
            
              {/* 수정 모드일 때 기존 필터 정보 표시 */}
              {mode === 'edit' && initialData && (
                <div className={styles.existingInfo}>
                  <span className={styles.existingLabel}>기존 설정:</span>
                  {initialData.locationNames && (
                    <span className={styles.existingTag}>
                      지역: {initialData.locationNames}
                    </span>
                  )}
                  {initialData.targetNames && (
                    <span className={styles.existingTag}>
                      대상: {initialData.targetNames}
                    </span>
                  )}
                  {initialData.themeNames && (
                    <span className={styles.existingTag}>
                      테마: {initialData.themeNames}
                    </span>
                  )}
                  {initialData.styleNames && (
                    <span className={styles.existingTag}>
                      스타일: {initialData.styleNames}
                    </span>
                  )}
                </div>
              )}
              <div className={styles.currentInfo}>
                <span className={styles.currentLabel}>현재 선택 :</span>
            {displayFilters.locationNames && (
                <span className={styles.currentTag}>
                지역: {displayFilters.locationNames}
                </span>
            )}
            {displayFilters.targetNames && (
                <span className={styles.currentTag}>
                대상: {displayFilters.targetNames}
                </span>
            )}
            {displayFilters.themeNames && (
                <span className={styles.currentTag}>
                테마: {displayFilters.themeNames}
                </span>
            )}
            {displayFilters.styleNames && (
                <span className={styles.currentTag}>
                스타일: {displayFilters.styleNames}
                </span>
            )}
            </div>
        </div>
        <div className={styles.filterSection}>
            <TravelmateFilter onSubmit={handleFilterSubmit} />
        </div>
        {validationErrors.locations && (
            <div className={styles.errorMessage}>{validationErrors.locations}</div>
        )}
        </div>

        {/* 여행 기간 - 전체 너비 */}
        <div className={styles.fullWidthSection}>
          <div className={styles.sectionHeader}>
            <label className={styles.sectionTitle}>
              여행 기간 <span className={styles.required}>*</span>
            </label>
            {/* 수정 모드일 때 기존 기간 정보 표시 */}
            {mode === 'edit' && initialData && initialData.startAt && initialData.endAt && (
              <div className={styles.existingInfo}>
                <span className={styles.existingLabel}>기존 설정:</span>
                <span className={styles.existingTag}>
                  {initialData.startAt.split('T')[0]} ~ {initialData.endAt.split('T')[0]}
                </span>
              </div>
            )}
            <div className={styles.currentInfo}>
              <span className={styles.currentLabel}>현재 선택 :</span>
              {dateData.startDate && dateData.endDate && (
                <span className={styles.currentTag}>
                  {dateData.startDate.dateString} ~ {dateData.endDate.dateString}
                </span>
              )}
              <button 
                type="button"
                className={styles.resetButton}
                onClick={handleDateReset}
              >
                <img src="/icons/common/refresh.svg" alt="reset"/>
              </button>
            </div>
          </div>
          <div className={styles.dateSelector}>
            <DateSelector onSubmit={handleDateSubmit} reset={dateReset} />
          </div>
          {validationErrors.dates && (
            <div className={styles.errorMessage}>{validationErrors.dates}</div>
          )}
        </div>

        {/* 모임 설명 - 전체 너비 */}
        <div className={styles.fullWidthSection}>
          <div className={styles.textareaGroup}>
            <label className={styles.sectionTitle}>
              모임 설명 <span className={styles.required}>*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`${styles.textarea} ${
                fieldValidation.description === 'valid' ? styles.validInput : 
                fieldValidation.description === 'invalid' ? styles.invalidInput : ''
              }`}
              placeholder="모임에 대한 상세한 설명을 작성해주세요"
              rows="8"
              required
            />
          </div>
          {validationErrors.description && (
            <div className={styles.errorMessage}>{validationErrors.description}</div>
          )}
        </div>

        {/* 모임 신청 안내 메시지 설명 - 전체 너비 */}
        <div className={styles.fullWidthSection}>
          <div className={styles.textareaGroup}>
            <label className={styles.sectionTitle}>
              모임 신청 안내 메시지 <span className={styles.required}>*</span>
            </label>
            <textarea
              name="applicationDescription"
              value={formData.applicationDescription}
              onChange={handleInputChange}
              className={`${styles.textarea} ${
                fieldValidation.applicationDescription === 'valid' ? styles.validInput : 
                fieldValidation.applicationDescription === 'invalid' ? styles.invalidInput : ''
              }`}
              placeholder="모임 신청자에게 전달할 안내 메시지를 작성해주세요"
              rows="6"
              required
            />
            {validationErrors.applicationDescription && (
              <div className={styles.errorMessage}>{validationErrors.applicationDescription}</div>
            )}
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className={styles.buttonRow}>
          <div className={styles.centerButtons}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              취소
            </button>
            <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? (
              <Circles height="20" width="20" color="#fff" />
            ) : (
              mode === 'create' ? '모임 생성' : '모임 수정'
            )}
          </button>
          </div>
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

export default TravelmateForm;