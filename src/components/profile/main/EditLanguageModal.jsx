import React, { useState } from "react";
import api from "../../../apis/api";
import API_ENDPOINTS from "../../../utils/constants";
import Modal from "../../common/Modal/Modal";
import { useParams } from "react-router-dom";
import styles from "./ProfileModal.module.css";

const proficiencyOptions = [
    { value: "LOW", label: "초급" },
    { value: "INTERMEDIATE", label: "중급" },
    { value: "HIGH", label: "고급" },
    { value: "NATIVE", label: "원어민" },
];

export default function EditLanguageModal({
        selectedLanguage,
        showEditLanguageModal, 
        setShowEditLanguageModal,
        onSubmit
    }) {
    const {userId} = useParams();
    const [proficiency, setProficiency] = useState(selectedLanguage.proficiency);

    const handleSubmit = async() => {
        try {
            await api.put(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/languages/${selectedLanguage.id}`, {
                userId: userId,
                id: selectedLanguage.id,
                proficiency: proficiency
            })
            setShowEditLanguageModal(false);
            onSubmit(selectedLanguage.id, proficiency);
        } catch (error) {
            console.error("Failed to update languageekekek");
        }
    }

    return (
        <Modal
            show={showEditLanguageModal}
            onClose={() => setShowEditLanguageModal(false)}
            onSubmit={handleSubmit}
            heading="언어 수정"
            firstLabel="저장"
            secondLabel="취소"
        >
            <div className={styles.formGroup}>
                <label>언어</label>
                <div className={styles.inputWrapper}>
                    <select className={styles.formInput}>
                        <option value={selectedLanguage.languageId}>{selectedLanguage.name}</option>
                    </select>
                </div>
            </div>
            <div className={styles.formGroup}>
                <label>레벨</label>
                <div className={styles.inputWrapper}>
                    <select
                        value={proficiency}
                        onChange={(e) => (setProficiency(e.target.value))}
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