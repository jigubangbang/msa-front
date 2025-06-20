import styles from './Header.module.css';
import logo from '../../assets/logo.png';
import diamond from '../../assets/main/diamond_white.svg';
import ProfileDropdown from './ProfileDropdown';
import { Link } from 'react-router-dom';


export default function Header() {
    return (
    <div className={styles.headerWrapper}>
        <div className={styles.scrollText}>
            <div className={styles.promoBanner}>
                <img src={diamond}/>
                <span>월 990원</span>
                <b>프리미엄 구독권</b>
                <img src={diamond}/>
                <span>Get membership for only ₩990/month</span>
                <b>Premium Subscription</b>
                <img src={diamond}/>
                <span>월 990원</span>
                <b>프리미엄 구독권</b>
                <img src={diamond}/>
                <span>Get membership for only ₩990/month</span>
                <b>Premium Subscription</b>
                <img src={diamond}/>
                <span>월 990원</span>
                <b>프리미엄 구독권</b>
                <img src={diamond}/>
                <span>Get membership for only ₩990/month</span>
                <b>Premium Subscription</b>
                <img src={diamond}/>
            </div>
        </div>
        <header className={styles.mainHeader}>

            <img src={logo} className={styles.logo}/>
            
            <nav className={styles.menu}>
                <span><Link to="/travel-test">스타일테스트</Link></span>
                <span><Link to="/style-guide">스타일가이드</Link></span>
                <span><Link to="/test-page">테스트페이지</Link></span>
                <span>퀘스트</span>
                <span>커뮤니티 <span className={styles.badge}>New</span></span>
                <span>여행기록 <span className={styles.badge}>New</span></span>
                <ProfileDropdown/>
            </nav>

            {/* Auth buttons */}
            <div className={styles.authButtons}>
                <span>로그인</span>
                <span>회원 가입</span>
                <button className={styles.proBtn}>Premium</button>
            </div>
        </header>
    </div>
  );
}