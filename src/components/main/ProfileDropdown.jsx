// components/ProfileDropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './ProfileDropdown.module.css';
import profileIcon from '../../assets/profile/profile-menu/profile.svg';
import globeIcon from '../../assets/profile/profile-menu/globe.svg';
import badgeIcon from '../../assets/profile/profile-menu/badge.svg';
import listIcon from '../../assets/profile/profile-menu/list.svg';
import inkpenIcon from '../../assets/profile/profile-menu/inkpen.svg';

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
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
        프로필 &nbsp;▾
      </button>

      {open && (
        <div className={styles.dropdownMenu}>
          <Link to="/profile">
            <div className={styles.dropdownItem}>
              <img src={profileIcon}/>프로필
            </div>
          </Link>
          <Link to="/countries">
            <div className={styles.dropdownItem}>
              <img src={globeIcon}/>국가
            </div>
          </Link>
          <Link to="/badges">
            <div className={styles.dropdownItem}>
              <img src={badgeIcon}/>뱃지함
            </div>
          </Link>
          <Link to="/bucketlist">
            <div className={styles.dropdownItem}>
              <img src={listIcon}/>버킷리스트
            </div>
          </Link>
          <Link to="/diary">
            <div className={styles.dropdownItem}>
              <img src={inkpenIcon}/>여행일지
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}