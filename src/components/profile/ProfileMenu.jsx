import styles from './ProfileSidebar.module.css';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';

export default function ProfileMenu() {
    const {userId} = useParams();
    return (
        <div className={styles.tabNav}>
            <Link to={`/${userId}/profile`} className={`${styles.tab} ${styles.active}`}>프로필</Link>
            <Link to={`/${userId}/countries`}className={styles.tab}>국가</Link>
            <Link to={`/${userId}/badges`} className={styles.tab}>뱃지함</Link>
            <Link to={`/${userId}/bucketlist`} className={styles.tab}>버킷리스트</Link>
            <Link to={`/${userId}/diary`} className={styles.tab}>여행 일지</Link>
        </div>
    );
}