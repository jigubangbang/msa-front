import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './ProfileDropdown.module.css';
import profileIcon from '../../assets/profile/profile-menu/profile.svg';
import globeIcon from '../../assets/profile/profile-menu/globe.svg';
import badgeIcon from '../../assets/profile/profile-menu/badge.svg';
import listIcon from '../../assets/profile/profile-menu/list.svg';
import inkpenIcon from '../../assets/profile/profile-menu/inkpen.svg';
import logoutIcon from '../../assets/auth/logout.svg'; 

export default function ProfileDropdown({ onLogout }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const userId = "bbb"; // TODO: 실제 로그인 유저 ID로 바꿔야 함


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.profileDropdownWrapper} ref={dropdownRef}>
      <button className={styles.dropdownToggle} onClick={() => setOpen(!open)}>
        프로필 ▾
      </button>

      {open && (
        <div className={styles.dropdownMenu}>
          <Link to={`/profile/${userId}/main`}>
            <div className={styles.dropdownItem}>
              <img src={profileIcon} alt="프로필" /> 프로필
            </div>
          </Link>
          <Link to={`/profile/${userId}/countries`}>
            <div className={styles.dropdownItem}>
              <img src={globeIcon} alt="국가" /> 국가
            </div>
          </Link>
          <Link to={`/profile/${userId}/badges`}>
            <div className={styles.dropdownItem}>
              <img src={badgeIcon} alt="뱃지함" /> 뱃지함
            </div>
          </Link>
          <Link to={`/profile/${userId}/bucketlist`}>
            <div className={styles.dropdownItem}>
              <img src={listIcon} alt="버킷리스트" /> 버킷리스트
            </div>
          </Link>
          <Link to={`/profile/${userId}/diary`}>
            <div className={styles.dropdownItem}>
              <img src={inkpenIcon} alt="여행일지" /> 여행일지
            </div>
          </Link>

          {/* 로그아웃 버튼 */}
          <div
            className={styles.dropdownItem}
            onClick={() => {
              setOpen(false);
              onLogout(); 
            }}
          >
            <img src={logoutIcon} alt="로그아웃" />
            로그아웃
          </div>
        </div>
      )}
    </div>
  );
}
