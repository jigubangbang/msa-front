import { useParams } from "react-router-dom";
import ProfileTemplate from "../../components/profile/ProfileTemplate";
import styles from "./Diary.module.css";
import { useState } from "react";
import CreateDiaryModal from "../../components/profile/diary/CreateDiaryModal";

export default function Diary() {
    const {userId} = useParams();
    const [showCreateDiaryModal, setShowCreateDiaryModal] = useState(false);
    

    return (
        <ProfileTemplate heading={`@${userId}`}>
            <div className={styles.mainWrapper}>
                <div className={styles.columnLeft}>

                </div>
                <div className={styles.columnRight}>
                    <button
                        className={`${styles.btn} ${styles.btnSecondary}`}
                        onClick={() => setShowCreateDiaryModal(true)}
                    >
                        일지 작성
                    </button>
                    {showCreateDiaryModal && (
                        <CreateDiaryModal onClose={() => setShowCreateDiaryModal(false)}/>
                    )}
                </div>
            </div>
        </ProfileTemplate>
    );
}