import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import logo from '../../assets/logo.png';
import diamond from '../../assets/main/diamond_white.svg';
import ProfileDropdown from './ProfileDropdown';
import NotificationDropdown from '../../pages/notification/NotificationDropdown';
import { jwtDecode } from "jwt-decode";

export default function Header({onOpenChat}) {

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('accessToken'));
  const [userId, setUserId] = useState();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('accessToken'));
  }, [location]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
      if (token) {
          const decoded = jwtDecode(token);
          setUserId(decoded.sub);
      }

  }, [isLoggedIn])

  const handleLogout = () => {
    navigate('/logout'); 
  };


  return (
    <div className={styles.headerWrapper}>
      <div className={styles.scrollText}>
        <Link to="/payment">
          <div className={styles.promoBanner}>
            <img src={diamond} />
            <span>월 990원</span>
            <b>프리미엄 구독권</b>
            <img src={diamond} />
            <span>Get membership for only ₩990/month</span>
            <b>Premium Subscription</b>
            <img src={diamond} />
            <span>월 990원</span>
            <b>프리미엄 구독권</b>
            <img src={diamond} />
            <span>Get membership for only ₩990/month</span>
            <b>Premium Subscription</b>
            <img src={diamond} />
            <span>월 990원</span>
            <b>프리미엄 구독권</b>
            <img src={diamond} />
            <span>Get membership for only ₩990/month</span>
            <b>Premium Subscription</b>
            <img src={diamond} />
          </div>
        </Link>
      </div>

      <header className={styles.mainHeader}>
        <Link to="/"><img src={logo} className={styles.logo} alt="logo" /></Link>

        <nav className={styles.menu}>
          {isLoggedIn && (
            <span><Link to={`/profile/${userId}/map`}>지도</Link></span>
          )}
          <span><Link to="/style-guide">스타일가이드</Link></span>
          <span><Link to="/quest">퀘스트</Link></span>
          <span><Link to="/traveler/mate">커뮤니티</Link><span className={styles.badge}>New</span></span>
          <span><Link to="/feed">여행기록</Link><span className={styles.badge}>New</span></span>
          <span onClick={onOpenChat} style={{ cursor: 'pointer' }}>채팅</span>
          <span onClick={() => {console.log(localStorage.getItem("accessToken"))}}>JWT 토큰</span>
        </nav>
        <div className={styles.authButtons}>
          {isLoggedIn ? (
            <>
              <NotificationDropdown userId={userId}/>
              <ProfileDropdown onLogout={handleLogout} />
            </>
          ) : (
            <Link to="/login"><span>로그인</span></Link>
          )}
          <Link to="/payment" className={styles.proBtn}><span>Premium</span></Link>
        </div>
      </header>
    </div>
  );
}
