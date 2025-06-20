import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import styles from "../../../pages/profile/Bucketlist.module.css"
import { useState } from "react";
import dragIcon from "../../../assets/profile/drag_grey.svg";
import editIcon from "../../../assets/profile/edit_grey.svg";
import deleteIcon from "../../../assets/profile/close_grey.svg";

export default function BucketlistItem({id, index, title, description, completionStatus, completedAt}) {
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

    function handleChange() {
        // TODO: add backend ((un)check bucketlist)
        setIsChecked(!isChecked);
    }
    return(
        <div id={styles.checklist} ref={setNodeRef} style={style} {...attributes}>
            <div className={styles.contentWrapper}>
                <label className={styles.customCheckbox}>
                    <input name="dummy" type="checkbox" checked={isChecked} onChange={handleChange}/>
                    <span className={styles.checkmark}></span>
                    <div className={styles.customCheckboxText}>
                        <div className={`${styles.title} ${isChecked ? styles.completed : ""}`}>{title}</div>
                        <div className={`${styles.description} ${isChecked ? styles.completed : ""}`}>{description}</div>
                    </div>
                </label>
                <div className={styles.deleteIcon}>
                    <img src={deleteIcon}/>
                </div>
                <div className={styles.dragHandle} {...listeners}>
                    <img src={dragIcon}/>
                </div>
            </div>
        </div>
    );
}