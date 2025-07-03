import styles from "./ProfileTemplate.module.css";
import Header from "../main/Header";
import ProfileMenu from "./ProfileMenu";
import ProfileSidebar from "./ProfileSidebar";
import NetworkMenu from "./NetworkMenu";

export default function ProfileTemplate({children, heading, isNetwork=false}) {
    return (
        <div className={styles.pageWrapper}>
            <div className={styles.profile}>
                <ProfileSidebar/>
                <div className={styles.mainContent}>
                    <div className={styles.heading}>
                        {heading}
                    </div>
                    {isNetwork ? (
                        <NetworkMenu/>
                    ) : (
                        <ProfileMenu/>
                    )}
                    {children}
                </div>
            </div>
        </div>
    );
}
