import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import styles from "../../../pages/profile/Bucketlist.module.css"
import { useState } from "react";
import axios from "axios";
import dragIcon from "../../../assets/profile/drag_grey.svg";
import editIcon from "../../../assets/profile/edit_grey.svg";
import deleteIcon from "../../../assets/profile/close_grey.svg";
import API_ENDPOINTS from "../../../utils/constants";

export default function BucketlistItem({id, title, description, completionStatus, completedAt, userId, activeDropdownOption, onDelete, onCheck}) {
    const [isChecked, setIsChecked] = useState(completionStatus);
    
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
        axios
            .put(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/bucketlist/${id}/status`, null)
            .then((response) => {
                setIsChecked(!isChecked);
                onCheck(newChecked);
            })
            .catch((err) => {
                console.error("Request failed", err);
            })
    }

    function handleDeleteClick() {
        axios
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
                <label className={styles.customCheckbox}>
                    <input name="dummy" type="checkbox" checked={isChecked} onChange={handleCheckboxClick}/>
                    <span className={styles.checkmark}></span>
                    <div className={styles.customCheckboxText}>
                        <div className={`${styles.title} ${isChecked ? styles.completed : ""}`}>{title}</div>
                        <div className={`${styles.description} ${isChecked ? styles.completed : ""}`}>{description}</div>
                        {
                            (isChecked && completedAt) && (
                                <div className={styles.description}>달성일 : {completedAt}</div>
                            )
                        }
                    </div>
                </label>
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
            </div>
        </div>
    );
}