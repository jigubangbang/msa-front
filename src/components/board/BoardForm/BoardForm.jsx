import React, { useState, useEffect, useRef } from 'react';
import api from '../../../apis/api';
import API_ENDPOINTS from '../../../utils/constants';
import styles from './BoardForm.module.css';

const BoardForm = ({ mode = 'create', currentUserId, isLogin, initialData = null, onSubmit, onClose }) => {
  const MAX_IMAGE_COUNT = 10;
  const fileInputRefs = useRef([]);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    boardId: '3'
  });

  const CATEGORY_OPTIONS = [
    { value: '1', label: '정보' },
    { value: '2', label: '추천' },
    { value: '3', label: '잡담' },
    { value: '4', label: '질문' }
  ];

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);

  // 유효성 검사 상태
  const [validationErrors, setValidationErrors] = useState({});
  const [fieldValidation, setFieldValidation] = useState({
    title: null,
    content: null
  });

  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef(null);

  const handleCategoryChange = (value) => {
    setFormData(prev => ({
      ...prev,
      boardId: value
    }));
    setCategoryDropdownOpen(false);
  };

  // 수정 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        title: initialData.title || '',
        content: initialData.content || '',
        boardId: initialData.boardId || ''
      });

      // 기존 이미지들을 images 배열에 설정
      if (initialData.images && initialData.images.length > 0) {
        const existingImages = initialData.images.map(imageUrl => ({
          file: null,
          preview: imageUrl,
          url: imageUrl,
          isExisting: true
        }));
        setImages(existingImages);
      }
    }
  }, [mode, initialData]);

  // 파일 입력 ref 설정
  useEffect(() => {
    fileInputRefs.current = Array(MAX_IMAGE_COUNT)
      .fill(null)
      .map((_, i) => fileInputRefs.current[i] || React.createRef());
  }, []);

  // 카테고리 드롭다운 외부 클릭 처리
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 유효성 검사 함수
  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        if (!value.trim()) {
          return { isValid: false, error: '제목은 필수입니다' };
        } else if (value.length > 100) {
          return { isValid: false, error: '제목은 100자를 초과할 수 없습니다' };
        }
        return { isValid: true, error: null };
        
      case 'content':
        if (!value.trim()) {
          return { isValid: false, error: '내용은 필수입니다' };
        } else if (value.length > 5000) {
          return { isValid: false, error: '내용은 5000자를 초과할 수 없습니다' };
        }
        return { isValid: true, error: null };
        
      default:
        return { isValid: true, error: null };
    }
  };

  // 입력 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 실시간 유효성 검사
    const validation = validateField(name, value);
    setFieldValidation(prev => ({
      ...prev,
      [name]: validation.isValid ? 'valid' : 'invalid'
    }));
    setValidationErrors(prev => ({
      ...prev,
      [name]: validation.error
    }));
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = (index, event) => {
    const file = event.target.files[0];
    setIsFileDialogOpen(false);

    if (file) {
      // 파일 검증
      if (file.size > 10 * 1024 * 1024) {
        alert('파일 크기는 10MB 이하여야 합니다.');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }

      // Object URL로 미리보기 생성
      const previewUrl = URL.createObjectURL(file);

      const newImages = [...images];
      newImages[index] = {
        file: file,
        preview: previewUrl,
        url: null,
        isExisting: false
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

  // 이미지 제거
  const removeImage = (index) => {
    const target = images[index];
    if (target?.preview && !target.isExisting) {
      URL.revokeObjectURL(target.preview);
    }

    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    
    if (fileInputRefs.current[index]?.current) {
      fileInputRefs.current[index].current.value = '';
    }
  };

  // 이미지 업로드 API 호출
  const uploadImage = async (file, type = 'board') => {
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


  // 전체 유효성 검사
  const validateAllFields = () => {
    const errors = {};
    let hasErrors = false;
    
    const titleValidation = validateField('title', formData.title);
    const contentValidation = validateField('content', formData.content);
    
    if (!titleValidation.isValid) {
      errors.title = titleValidation.error;
      hasErrors = true;
    }
    
    if (!contentValidation.isValid) {
      errors.content = contentValidation.error;
      hasErrors = true;
    }
    
    setValidationErrors(errors);
    
    setFieldValidation({
      title: titleValidation.isValid ? 'valid' : 'invalid',
      content: contentValidation.isValid ? 'valid' : 'invalid'
    });
    
    return !hasErrors;
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLogin) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    // 전체 유효성 검사
    if (!validateAllFields()) {
      alert('입력값을 확인해주세요.');
      return;
    }

    setLoading(true);
    
    try {
      const imageUrls = [];
      
      // 새로운 이미지들 업로드
      for (const image of images) {
        if (image) {
          if (image.isExisting) {
            // 기존 이미지는 URL 그대로 사용
            imageUrls.push(image.url);
          } else if (image.file) {
            // 새로운 이미지는 업로드
            const uploadedUrl = await uploadImage(image.file);
            imageUrls.push(uploadedUrl);
          }
        }
      }

      // 제출 데이터 구성
      const submitData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        boardId: formData.boardId,
        images: imageUrls
      };

      // 부모 컴포넌트로 데이터 전달
      await onSubmit(submitData);
      
    } catch (error) {
      console.error('Failed to submit form:', error);
      // 에러는 이미 부모 컴포넌트에서 처리됨
    } finally {
      setLoading(false);
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    if (onClose) {
      onClose();
    }
  };

  if (loading && mode === 'edit' && !initialData) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {mode === 'create' ? '게시글 작성' : '게시글 수정'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 제목과 카테고리 섹션 */}
        <div className={styles.titleSection}>
          <div className={styles.categoryColumn}>
            <div className={styles.formGroup}>
            <label className={styles.label}>카테고리</label>
            <div className={styles.categoryDropdown} ref={categoryDropdownRef}>
              <button 
                type="button"
                className={styles.categoryToggle} 
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              >
                {CATEGORY_OPTIONS.find(option => option.value === formData.boardId)?.label || '카테고리 선택'}
                <span className={`${styles.arrow} ${categoryDropdownOpen ? styles.arrowOpen : ''}`}>▾</span>
              </button>
              
              {categoryDropdownOpen && (
                <div className={styles.categoryMenu}>
                  {CATEGORY_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      className={`${styles.categoryItem} ${
                        formData.boardId === option.value ? styles.active : ''
                      }`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleCategoryChange(option.value);
                      }}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
            </div>
          </div>

          <div className={styles.titleColumn}>
            <div className={styles.formGroup}>
              <label className={styles.label}>제목</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`${styles.input} ${
                  fieldValidation.title === 'valid' ? styles.validInput : 
                  fieldValidation.title === 'invalid' ? styles.invalidInput : ''
                }`}
                placeholder="제목을 입력하세요"
                required
              />
              {validationErrors.title && (
                <div className={styles.errorMessage}>{validationErrors.title}</div>
              )}
            </div>
          </div>
        </div>

        {/* 이미지 업로드 섹션 */}
        <div className={styles.imageSection}>
          <label className={styles.label}>이미지 ({images.filter(img => img).length}/{MAX_IMAGE_COUNT})</label>
          <div className={styles.imageUploadContainer}>
            <div className={styles.imageSlotContainer}>
              {/* 기존 이미지들과 빈 슬롯들 */}
              {Array.from({ length: Math.max(images.length + 1, 1) }, (_, index) => {
                const image = images[index];
                return (
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
                          type="button"
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
                      index < MAX_IMAGE_COUNT && (
                        <div 
                          className={styles.emptySlot}
                          onClick={(e) => openFileDialog(index, e)}
                        >
                          <span className={styles.uploadIcon}>📷</span>
                          <p className={styles.uploadText}>이미지 업로드</p>
                        </div>
                      )
                    )}
                  </div>
                );
              })}
            </div>
            <div className={styles.imageHelp}>
              <p>• 최대 {MAX_IMAGE_COUNT}개의 이미지를 업로드할 수 있습니다</p>
              <p>• 파일 크기는 10MB 이하여야 합니다</p>
            </div>
          </div>
        </div>

        {/* 내용 입력 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>내용</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            className={`${styles.textarea} ${
              fieldValidation.content === 'valid' ? styles.validInput : 
              fieldValidation.content === 'invalid' ? styles.invalidInput : ''
            }`}
            placeholder="내용을 입력하세요"
            rows="15"
            required
          />
          {validationErrors.content && (
            <div className={styles.errorMessage}>{validationErrors.content}</div>
          )}
        </div>

        {/* 제출 버튼 */}
        <div className={styles.actions}>
          <button 
            type="button" 
            className={styles.cancelButton} 
            onClick={handleCancel}
            disabled={loading}
          >
            취소
          </button>
          <button 
            type="submit" 
            className={styles.submitButton} 
            disabled={loading}
          >
            {loading ? '저장 중...' : (mode === 'create' ? '작성하기' : '수정하기')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BoardForm;