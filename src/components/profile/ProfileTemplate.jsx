import styles from "./ProfileTemplate.module.css";
import Header from "../main/Header";
import ProfileMenu from "./ProfileMenu";
import ProfileSidebar from "./ProfileSidebar";

export default function ProfileTemplate({children, heading="@username"}) {
    return (
        <div className={styles.pageWrapper}>
            <Header/>
            <div className={styles.profile}>
                <ProfileSidebar/>
                <div className={styles.mainContent}>
                    <div className={styles.heading}>
                        {heading}
                    </div>
                    <ProfileMenu/>
                    {children}
                </div>
            </div>
        </div>
    );
}
