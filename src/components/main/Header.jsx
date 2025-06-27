import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import logo from '../../assets/logo.png';
import diamond from '../../assets/main/diamond_white.svg';
import ProfileDropdown from './ProfileDropdown';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('accessToken'));
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('accessToken'));
  }, [location]);

  const handleLogout = () => {
    navigate('/logout'); 
  };

  return (
    <div className={styles.headerWrapper}>
      <div className={styles.scrollText}>
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
      </div>

      <header className={styles.mainHeader}>
        <Link to="/"><img src={logo} className={styles.logo} alt="logo" /></Link>

        <nav className={styles.menu}>
          <span><Link to="/map">지도</Link></span>
          <span><Link to="/style-guide">스타일가이드</Link></span>
          <span><Link to="/quest">퀘스트</Link></span>
          <span>커뮤니티 <span className={styles.badge}>New</span></span>
          <span>여행기록 <span className={styles.badge}>New</span></span>
          {isLoggedIn && <ProfileDropdown onLogout={handleLogout} />}
        </nav>

        <div className={styles.authButtons}>
          {!isLoggedIn && (
            <>
              <Link to="/login"><span>로그인</span></Link>
            </>
          )}
          <button className={styles.proBtn}>Premium</button>
        </div>
      </header>
    </div>
  );
}
