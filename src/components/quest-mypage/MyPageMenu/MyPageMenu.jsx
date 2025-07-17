import styles from './MyPageMenu.module.css';
import { Link, useLocation, useParams } from 'react-router-dom';

export default function MyPageMenu({isMine}) {
    const {userId} = useParams(); 
    const location = useLocation();

    const getActiveTab = () => {
        const pathname = location.pathname;
        if (pathname.includes('/badge')) return 'badges';
        if (pathname.includes('/record')) return 'quests';
        return 'journey';
    };

    const activeTab = getActiveTab();
    
    // 로그인하면 /my-quest/*, 아니면 /my-quest/profile/${userId}/*
    const basePath = isMine ? '/my-quest' : `/my-quest/profile/${userId}`;
    const badgePath = isMine ? '/my-quest/badge' : `/my-quest/profile/${userId}/badges`;
    const questPath = isMine? '/my-quest/record' : `/my-quest/profile/${userId}/record`;

    return (
        <div className={styles.list}>
            <div className={styles.tabNav}>
                <Link 
                    to={basePath} 
                    className={`${styles.tab} ${activeTab === 'journey' ? styles.active : ''}`}
                >
                    활동
                </Link>
                <Link 
                    to={badgePath} 
                    className={`${styles.tab} ${activeTab === 'badges' ? styles.active : ''}`}
                >
                    뱃지
                </Link>
                <Link 
                    to={questPath} 
                    className={`${styles.tab} ${activeTab === 'quests' ? styles.active : ''}`}
                >
                    퀘스트
                </Link>
            </div>
        </div>
    );
}