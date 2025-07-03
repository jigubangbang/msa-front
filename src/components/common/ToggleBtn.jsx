import { useState } from "react";
import styles from "../../pages/main/Main.module.css";

export default function ToggleBtn({firstOption, secondOption, firstValue, secondValue, onToggle}) {
    const [isChecked, setIsChecked] = useState(false);

    const handleChange = (e) => {
        const checked = e.target.checked;
        setIsChecked(checked);

        if (onToggle) {
            onToggle(checked ? secondValue : firstValue);
        }
    }

    return(
        <>
            <input 
                type="checkbox" 
                id="toggle" 
                className={styles.toggleCheckbox}
                checked={isChecked}
                onChange={handleChange}
            />
            <label for="toggle" className={styles.toggleContainer}>
                <div>{firstOption}</div>
                <div className={styles.toggleOption}>{secondOption}</div>
            </label>
        </>
    );
}