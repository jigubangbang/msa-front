import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useChatContext } from '../../utils/ChatContext';
import styles from './Header.module.css';
import logo from '../../assets/logo.png';
import diamond from '../../assets/main/diamond_white.svg';
import ProfileDropdown from './ProfileDropdown';
import NotificationDropdown from '../../pages/notification/NotificationDropdown';
import { jwtDecode } from "jwt-decode";
import LoginConfirmModal from '../common/LoginConfirmModal/LoginConfirmModal';

export default function Header({onOpenChat}) {

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('accessToken'));
  const [userId, setUserId] = useState();
  const [showLoginConfirmModal, setShowLoginConfirmModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { closeAllChats } = useChatContext();

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
    console.log('[Header] 수동 로그아웃 - 모든 채팅방 정리');
    closeAllChats();
    navigate('/logout'); 
  };

  const handlePremiumClick = () => {
    if (isLoggedIn) {
      navigate('/payment');
    } else {
      setShowLoginConfirmModal(true);
    }
  };


  return (
    <div className={styles.headerWrapper}>
      <div className={styles.scrollText}>
        <div onClick={handlePremiumClick} style={{ cursor: 'pointer' }}>
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
      </div>

      <header className={styles.mainHeader}>
        <Link to="/"><img src={logo} className={styles.logo} alt="logo" /></Link>

        <nav className={styles.menu}>
          {isLoggedIn && (
            <span>
              <Link
                to={`/profile/${userId}/map`}
                className={location.pathname===`/profile/${userId}/map` ? styles.activeLink : ''}
              >
                  지도
              </Link>
            </span>
          )}
          <span>
            <Link
              to="/quest"
              className={location.pathname.startsWith('/quest') ? styles.activeLink : ''}
            >
              퀘스트
            </Link>
          </span>
          <span>
            <Link
              to="/traveler/mate"
              className={location.pathname.startsWith('/traveler') ? styles.activeLink : ''}
            >
              커뮤니티
            </Link>
            <span className={styles.badge}>New</span>
          </span>
          <span>
            <Link
              to="/feed"
              className={location.pathname.startsWith('/feed') ? styles.activeLink : ''}
            >
              여행기록
            </Link>
          </span>
          <span>
            <Link
              to={`/profile/${userId}/diary`}
              className={location.pathname.startsWith(`/profile/${userId}/diary`) ? styles.activeLink : ''}
            >
              나의 여행일지
            </Link>
          </span>
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
          <div onClick={handlePremiumClick} className={styles.proBtn}><span>Premium</span></div>
        </div>
      </header>

      {showLoginConfirmModal && (
        <LoginConfirmModal
          isOpen={showLoginConfirmModal}
          onClose={() => setShowLoginConfirmModal(false)}
        />
      )}
    </div>
  );
}

