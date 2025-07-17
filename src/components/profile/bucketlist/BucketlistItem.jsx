import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import styles from "../../../pages/profile/Bucketlist.module.css"
import { useState } from "react";
import api from "../../../apis/api";
import dragIcon from "../../../assets/profile/drag_grey.svg";
import deleteIcon from "../../../assets/profile/close_grey.svg";
import API_ENDPOINTS from "../../../utils/constants";

export default function BucketlistItem({id, title, description, completionStatus, completedAt, userId, sessionUserId, activeDropdownOption, onDelete, onCheck, updateDate}) {
    const [isChecked, setIsChecked] = useState(completionStatus);
    const [newDate, setNewDate] = useState(completedAt);
    
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    function handleCheckboxClick() {
        const newChecked = !isChecked;
        api
            .put(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/bucketlist/${id}/status`, null)
            .then((response) => {
                setIsChecked(!isChecked);
                onCheck(newChecked);
                setNewDate(response.data.completedAt);
                updateDate(id, response.data.completedAt);
            })
            .catch((err) => {
                console.error("Request failed", err);
            })
    }

    function handleDeleteClick() {
        api
            .delete(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/bucketlist/${id}`, null)
            .then(() => {
                onDelete(id, completionStatus);
            })
            .catch((err) => {
                console.error("Request failed", err);
            })
    }

    return(
        <div id={styles.checklist} ref={setNodeRef} style={style} {...attributes}>
            <div className={styles.contentWrapper}>
                <label className={`${styles.customCheckbox} ${(sessionUserId !== userId ? styles.disabled : '')}`}>
                    <input name="dummy" type="checkbox" checked={isChecked} onChange={handleCheckboxClick} disabled={sessionUserId !== userId}/>
                    {sessionUserId === userId && (
                        <span className={styles.checkmark}></span>
                    )}
                    <div className={styles.customCheckboxText}>
                        <div className={`${styles.title} ${isChecked ? styles.completed : ""}`}>{title}</div>
                        <div className={`${styles.description} ${isChecked ? styles.completed : ""}`}>{description}</div>
                        {
                            (isChecked && newDate) && (
                                <div className={styles.description}>달성일 : {newDate}</div>
                            )
                        }
                    </div>
                </label>
                {userId === sessionUserId && (
                    <div className={styles.iconWrapper}>
                        <button className={styles.deleteIcon} onClick={handleDeleteClick}>
                            <img src={deleteIcon}/>
                        </button>
                        {
                            activeDropdownOption == "전체" && (
                                <div className={styles.dragHandle} {...listeners}>
                                    <img src={dragIcon}/>
                                </div>
                            )
                        }
                    </div>
                )}
            </div>
        </div>
    );
}