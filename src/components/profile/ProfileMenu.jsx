import styles from './ProfileSidebar.module.css';
import { Link, useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';

export default function ProfileMenu() {
    const {userId} = useParams();
    const location = useLocation();
    const isActive = (path) => location.pathname.startsWith(`/profile/${userId}/${path}`);

    return (
        <div className={styles.tabNav}>
            <Link to={`/profile/${userId}/main`} className={`${styles.tab} ${isActive("main") ? styles.active : ""}`}>프로필</Link>
            <Link to={`/profile/${userId}/countries`} className={`${styles.tab} ${isActive("countries") ? styles.active : ""}`}>국가</Link>
            <Link to={`/profile/${userId}/badges`} className={`${styles.tab} ${isActive("badges") ? styles.active : ""}`}>뱃지함</Link>
            <Link to={`/profile/${userId}/bucketlist`} className={`${styles.tab} ${isActive("bucketlist") ? styles.active : ""}`}>버킷리스트</Link>
            <Link to={`/profile/${userId}/diary`} className={`${styles.tab} ${isActive("diary") ? styles.active : ""}`}>여행 일지</Link>
        </div>
    );
}