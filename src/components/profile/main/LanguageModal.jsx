import React, { useEffect, useState } from "react";
import styles from "./LanguageModal.module.css";
import axios from "axios";
import API_ENDPOINTS from "../../../utils/constants";
import SearchBar from "../../common/SearchBar";

const proficiencyOptions = [
    { value: "LOW", label: "초급" },
    { value: "INTERMEDIATE", label: "중급" },
    { value: "HIGH", label: "고급" },
    { value: "NATIVE", label: "원어민" },
];

export default function LanguageModal({ userId, onClose, onLanguageAdded }) {
    const [languageId, setLanguageId] = useState("");
    const [proficiency, setProficiency] = useState("LOW");
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState("");
    const [languages, setLanguages] = useState([]); // search results
    const [showDropdown, setShowDropdown] = useState(false);

    const fetchLanguages = async () => {
        try {
            const response = await axios.get(`${API_ENDPOINTS.MYPAGE.PROFILE}/{userId}/languages/search`, {
                params: keyword ? {keyword} : {}
            });
            
            setLanguages(response.data.languages);
        } catch (error) {
            console.error("Failed to fetch languages", error);
        }
    }

    const handleInputFocus = () => {
        fetchLanguages();
        setShowDropdown(true);
    }

    const handleSubmit = async () => {
        if (!languageId) return;
        setLoading(true);
        try {
            await axios.post(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/languages`, {
                languageId: languageId,
                proficiency: proficiency,
            });
            onLanguageAdded(); // refresh list
            onClose(); // close modal
        } catch (error) {
            console.error("Failed to add language", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (keyword.trim() !== '') {
            fetchLanguages();
            setShowDropdown(true);
        }
    }, [keyword]);

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.heading}>언어 추가</h2>
                <div className={styles.wrapper}>
                    <SearchBar
                        placeholder="추가할 언어를 입력하세요"
                        onSearchChange={setKeyword}
                        onFocus={handleInputFocus}
                        barWidth="300px"
                    />

                    {showDropdown && languages.length > 0 && (
                        <div className={styles.languageList}>
                            {languages.map((lang) => (
                                <div key={lang.id} className={styles.languageItem}>
                                    {lang.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <input
                    type="text"
                    placeholder="언어명 입력"
                    value={languageId}
                    onChange={(e) => setLanguageId(e.target.value)}
                    className={styles.input}
                />
                <select
                    value={proficiency}
                    onChange={(e) => setProficiency(e.target.value)}
                    className={styles.select}
                >
                    {proficiencyOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <button 
                    onClick={handleSubmit} 
                    className={styles.addButton}
                    disabled={loading}
                >
                    {loading ? "추가 중..." : "추가"}
                </button>
                <button className={styles.closeButton} onClick={onClose}>닫기</button>
            </div>
        </div>
    );
}
