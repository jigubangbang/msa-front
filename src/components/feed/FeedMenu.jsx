// FeedMenu.jsx
import styles from "./FeedMenu.module.css";

export default function FeedMenu({ 
        sessionUserId, userId, onClose, type="post", 
        setShowReportModal,
        setShowEditModal,
        setShowDeleteModal,
        setShowPrivacyModal}) {
    const isOwner = sessionUserId === userId;

    const onReportClick = () => {
        setShowReportModal(true);
        onClose();
    }

    const onEditClick = () => {
        setShowEditModal(true);
        onClose();
    }

    const onDeleteClick = () => {
        setShowDeleteModal(true);
        onClose();
    }

    const onPrivacyClick = () => {
        setShowPrivacyModal(true);
        onClose();
    }

    return (
        <div className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
            {isOwner ? (
                <>
                    <button className={`${styles.dropdownItem} ${styles.warning}`} onClick={onDeleteClick}>삭제</button>
                    {type === "post" && (
                        <>
                            <button className={styles.dropdownItem} onClick={onEditClick}>수정</button>
                            <button className={styles.dropdownItem} onClick={onPrivacyClick}>공개 설정</button>
                        </>
                    )}
                </>
                ) : (
                    <button className={`${styles.dropdownItem} ${styles.warning}`} onClick={onReportClick}>신고</button>
                )
            }
            <button className={styles.dropdownItem} onClick={onClose}>닫기</button>
        </div>
    );
}
