// components/Modal.jsx
import styles from "./Modal.module.css";

export default function Modal({ show, onClose, children }) {
    if (!show) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>×</button>
                {children}
            </div>
        </div>
    );
}
