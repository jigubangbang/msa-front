import styles from './ProfileSidebar.module.css';
import { Link } from 'react-router-dom';

export default function ProfileMenu() {
    return (
        <div className={styles.tabNav}>
            <Link to="/profile" className={`${styles.tab} ${styles.active}`}>프로필</Link>
            <Link to="/countries" className={styles.tab}>국가</Link>
            <Link to="/badges" className={styles.tab}>뱃지함</Link>
            <Link to="/bucketlist" className={styles.tab}>버킷리스트</Link>
            <Link to="/journal" className={styles.tab}>여행 일지</Link>
        </div>
    );
}