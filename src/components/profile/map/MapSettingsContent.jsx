import styles from "./MapSettingsContent.module.css";

export default function MapSettingscontent({selectedColor, setSelectedColor}) {
    const colors = [
        { name: "GREEN", hex: "#93AD28" },
        { name: "PINK", hex: "#FFB6C1" },
        { name: "YELLOW", hex: "#F1DC81" },
        { name: "BLUE", hex: "#83D9E0" }
    ];

    return (
        <div className={styles.colorGrid}>
            {colors.map((color) => (
                <div
                    key={color.name}
                    className={`${styles.colorCircle} ${selectedColor === color.name ? styles.selected : ""}`}
                    style={{ backgroundColor: color.hex }}
                    onClick={() => setSelectedColor(color.name)}
                >
                    {selectedColor === color.name && <span className={styles.checkmark}></span>}
                </div>
            ))}
        </div>
    );
}