import React, { useState, useRef, useEffect } from 'react';
import styles from './DetailDropdown.module.css';

const DetailDropdown = ({ 
  isCreator = false, 
  onReport, 
  onEdit, 
  onDelete,
  onLeave,
  showLeave
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleItemClick = (action) => {
    setIsOpen(false);
    action();
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button 
        className={styles.dropdownToggle}
        onClick={() => setIsOpen(!isOpen)}
      >
        <img 
          src="/icons/common/menu.svg" 
          alt="메뉴"
          className={styles.menuIcon}
        />
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          {!isCreator && (<div 
            className={styles.dropdownItem}
            onClick={() => handleItemClick(onReport)}
          >
            신고하기
          </div>)}
          {showLeave && onLeave && (
            <div 
              className={styles.dropdownItem}
              onClick={() => handleItemClick(onLeave)}
            >
              모임 나가기
            </div>
          )}
          
          {isCreator && (
            <>
              <div 
                className={styles.dropdownItem}
                onClick={() => handleItemClick(onEdit)}
              >
                수정하기
              </div>
              <div 
                className={styles.dropdownItem}
                onClick={() => handleItemClick(onDelete)}
              >
                삭제하기
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DetailDropdown;