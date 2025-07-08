
import styles from "./CreateDiaryModal.module.css";

export default function PostContentStep({title, publicStatus, setTitle, setPublicStatus}) {
    return (
        <>
            <div className={styles.formGroup}>
                <label>공개 여부</label>
                <div className={styles.inputWrapper}>
                    <select
                        value={publicStatus}
                        onChange={(e) => setPublicStatus(e.target.value)}
                        className={styles.formInput}
                    >
                        <option value={true}>공개</option>
                        <option value={false}>비공개</option>
                    </select>
                </div>
            </div>
            <div className={styles.formGroup}>
                <label>내용</label>
                <div className={styles.inputWrapper}>
                    <textarea
                        className={styles.formInput}
                        value={title}
                        maxLength={120}
                        rows={6}
                        placeholder="내용을 입력하세요"
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
            </div>
        </>
    );
}