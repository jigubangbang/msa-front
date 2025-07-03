import { Link, useLocation, useParams } from "react-router-dom";
import styles from './ProfileSidebar.module.css';

export default function NetworkMenu() {
    const {userId} = useParams(); 
    const location = useLocation();
    const isActive = (path) => location.pathname.startsWith(`/profile/${userId}/${path}`);

    return (
        <div className={styles.tabNav}>
            <Link to={`/profile/${userId}/following`} className={`${styles.tab} ${isActive("following") ? styles.active : ""}`}>
                팔로잉
            </Link>
            <Link to={`/profile/${userId}/followers`} className={`${styles.tab} ${isActive("followers") ? styles.active : ""}`}>
                팔로워
            </Link>
        </div>
    );
}