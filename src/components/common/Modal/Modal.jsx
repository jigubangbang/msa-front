import styles from "./Modal.module.css";

export default function Modal({ 
    show, 
    onClose, 
    onSubmit, 
    children,
    heading,
    firstLabel="확인",
    secondLabel
 }) {
    if (!show) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                {heading && (<h2>{heading}</h2>)}
                <div className={styles.formGroup}>
                    {children}
                </div>
                <div className={styles.btnContainer}>
                    <button className={`${styles.btn} ${styles.darkButton}`} onClick={onSubmit}>{firstLabel}</button>
                    {secondLabel && (
                        <button className={`${styles.btn} ${styles.outlineButton}`} onClick={onClose}>{secondLabel}</button>
                    )}
                </div>
            </div>
        </div>
    );
}
