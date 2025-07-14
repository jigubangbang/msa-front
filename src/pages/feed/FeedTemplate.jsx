import { useLocation } from "react-router-dom";
import Sidebar from "../../components/common/SideBar/SideBar";
import { FEED_SIDEBAR } from "../../utils/sidebar";
import styles from "./Feed.module.css"
import { useEffect, useMemo, useState } from "react";

export default function FeedTemplate({children}) {
    const location = useLocation();
    const currentPath = location.pathname;
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const finalMenuItems = useMemo(() => {
        return FEED_SIDEBAR(isLoggedIn).map((item) => ({
            ...item,
            active:
                currentPath === item.path ||
                currentPath.startsWith(item.path + "/"),
        }));
    }, [isLoggedIn, currentPath]);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    return (
        <div className={styles.Container}>
            <Sidebar menuItems={finalMenuItems}/>
            <div className={styles.content}>
                {children}
            </div>
        </div>
    );
}