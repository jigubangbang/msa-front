import styles from "../../pages/main/Main.module.css";

export default function ToggleBtn({firstOption, secondOption}) {
    return(
        <>
            <input type="checkbox" id="toggle" className={styles.toggleCheckbox}/>
            <label for="toggle" className={styles.toggleContainer}>
                <div>{firstOption}</div>
                <div className={styles.toggleOption}>{secondOption}</div>
            </label>
        </>
    );
}