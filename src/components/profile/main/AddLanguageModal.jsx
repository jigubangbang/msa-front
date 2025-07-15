import Modal from "../../common/Modal/Modal";
import React, { useEffect, useState } from "react";
import api from "../../../apis/api";
import styles from "./ProfileModal.module.css";
import { useParams } from "react-router-dom";
import API_ENDPOINTS from "../../../utils/constants";

const proficiencyOptions = [
    { value: "LOW", label: "초급" },
    { value: "INTERMEDIATE", label: "중급" },
    { value: "HIGH", label: "고급" },
    { value: "NATIVE", label: "원어민" },
];

export default function AddLanguageModal({showAddLanguageModal, setShowAddLanguageModal, onSubmit}) {
    const {userId} = useParams();
    const [selectedLanguage, setSelectedLanguage] = useState("");
    const [proficiency, setProficiency] = useState("LOW");
    const [languages, setLanguages] = useState([]);

    const fetchLanguages = async () => {
        try {
            const response = await api.get(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/languages/search`, {});
            setLanguages(response.data.languages);
        } catch (error) {
            console.error("Failed to fetch languages", error);
        }
    }

    const handleSubmit = async() => {
        const language = languages.find(l => l.id === Number(selectedLanguage));
        if (!selectedLanguage) return;

        const newLanguage = ({
            userId: userId,
            languageId: language.id,
            name: language.name,
            proficiency: proficiency,
        });
        try {
            const response = await api.post(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/languages`, newLanguage);
            setShowAddLanguageModal(false);
            const id = response.data.id;
            const languageWithId = {...newLanguage, id};
            onSubmit(languageWithId);
        } catch (error) {
            console.error("Failed to add language", error);
        }
    }

    useEffect(() => {
        fetchLanguages();
    }, []);

    useEffect(() => {
        if (languages.length > 0) {
            const firstAvailable = languages.find((lang) => !lang.addStatus);
            if (firstAvailable) {
                setSelectedLanguage(firstAvailable.id);
            }
        }
    }, [languages]);

    return (
        <Modal
            show={showAddLanguageModal}
            onClose={() => setShowAddLanguageModal(false)}
            onSubmit={handleSubmit}
            heading="언어 추가"
            firstLabel="추가"
            secondLabel="취소"
        >
            <div className={styles.formGroup}>
                <label>언어</label>
                <div className={styles.inputWrapper}>
                    {languages && (
                        <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className={styles.formInput}
                        >
                            {languages
                            .filter((lang) => !lang.addStatus)
                            .map((lang) => (
                                <option key={lang.id} value={lang.id}>{lang.name}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>
            <div className={styles.formGroup}>
                <label>레벨</label>
                <div className={styles.inputWrapper}>
                    <select
                        value={proficiency}
                        onChange={(e) => setProficiency(e.target.value)}
                        className={styles.formInput}
                    >
                        {proficiencyOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </Modal>
    );
}