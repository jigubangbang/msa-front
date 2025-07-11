import { useLocation } from "react-router-dom";
import Sidebar from "../../components/common/SideBar/SideBar";
import { FEED_SIDEBAR } from "../../utils/sidebar";
import styles from "./Feed.module.css"

export default function FeedTemplate({children}) {
    const location = useLocation();
    const currentPath = location.pathname;

    const getActiveMenuItems = () => {
        return FEED_SIDEBAR.map((item) => ({
            ...item,
            active:
                currentPath === item.path || currentPath.startsWith(item.path + "/")
        }));
    };
    const finalMenuItems = getActiveMenuItems();

    return (
        <div className={styles.Container}>
            <Sidebar menuItems={finalMenuItems}/>
            <div className={styles.content}>
                {children}
            </div>
        </div>
    );
}