import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import styles from './ProfileDropdown.module.css';
import profileIcon from '../../assets/profile/profile-menu/profile.svg';
import globeIcon from '../../assets/profile/profile-menu/globe.svg';
import badgeIcon from '../../assets/profile/profile-menu/badge.svg';
import listIcon from '../../assets/profile/profile-menu/list.svg';
import inkpenIcon from '../../assets/profile/profile-menu/inkpen.svg';
import logoutIcon from '../../assets/profile/profile-menu/logout.svg'; 
import manageIcon from '../../assets/profile/profile-menu/manage.svg'; 
import adminIcon from '../../assets/profile/profile-menu/admin.svg';

export default function ProfileDropdown({ onLogout }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [userId, setUserId] = useState();
  const [userRole, setUserRole] = useState();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
      if (token) {
          const decoded = jwtDecode(token);
          setUserId(decoded.sub);
          setUserRole(Array.isArray(decoded.role) ? decoded.role : [decoded.role]);
      }
    
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCloseDropdown = () => {
    setOpen(false);
  };

  return (
    <div className={styles.profileDropdownWrapper} ref={dropdownRef}>
      <button className={styles.dropdownToggle} onClick={() => setOpen(!open)}>
        {userId || '프로필'} ▾
      </button>

      {open && (
        <div className={styles.dropdownMenu}>
          <Link to={`/profile/${userId}`} onClick={handleCloseDropdown}>
            <div className={styles.dropdownItem}>
              <img src={profileIcon} alt="프로필" /> 프로필
            </div>
          </Link>
          <Link to={`/profile/${userId}/countries`} onClick={handleCloseDropdown}>
            <div className={styles.dropdownItem}>
              <img src={globeIcon} alt="국가" /> 국가
            </div>
          </Link>
          <Link to={`/profile/${userId}/badges`} onClick={handleCloseDropdown}>
            <div className={styles.dropdownItem}>
              <img src={badgeIcon} alt="뱃지함" /> 뱃지함
            </div>
          </Link>
          <Link to={`/profile/${userId}/bucketlist`} onClick={handleCloseDropdown}>
            <div className={styles.dropdownItem}>
              <img src={listIcon} alt="버킷리스트" /> 버킷리스트
            </div>
          </Link>
          <Link to={`/profile/${userId}/diary`} onClick={handleCloseDropdown}>
            <div className={styles.dropdownItem}>
              <img src={inkpenIcon} alt="여행일지" /> 여행일지
            </div>
          </Link>

          <div className={styles.dropdownDivider}></div>
          <Link to={`/user/manage`} onClick={handleCloseDropdown}>
            <div className={styles.dropdownItem}>
              <img src={manageIcon} alt="계정관리" /> 계정 관리
            </div>
          </Link>

          {userRole?.includes('ROLE_ADMIN') && (
            <Link to="/admin/users" onClick={handleCloseDropdown}>
              <div className={styles.dropdownItem}>
                <img src={adminIcon} alt="관리자"/>
                관리자
              </div>
            </Link>
          )}

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
