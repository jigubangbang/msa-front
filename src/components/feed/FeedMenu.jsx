import { useEffect, useRef } from "react";
import styles from "./FeedMenu.module.css";

export default function FeedMenu({ 
        sessionUserId, userId, onClose, type="post", 
        setShowReportModal,
        setShowEditModal,
        setShowDeleteModal,
        setShowPrivacyModal}) {
    const isOwner = sessionUserId === userId;
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [onClose])



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
        <div ref={menuRef} className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
            {isOwner ? (
                <>
                    <button className={`${styles.dropdownItem} ${styles.warning}`} onClick={onDeleteClick}>삭제하기</button>
                    {type === "post" && (
                        <>
                            <button className={styles.dropdownItem} onClick={onEditClick}>수정하기</button>
                            <button className={styles.dropdownItem} onClick={onPrivacyClick}>공개 설정</button>
                        </>
                    )}
                </>
                ) : (
                    <button className={`${styles.dropdownItem} ${styles.warning}`} onClick={onReportClick}>신고하기</button>
                )
            }
        </div>
    );
}
