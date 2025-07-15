import React, { useEffect, useState } from "react";
import api from "../../../apis/api";
import styles from "./ProfileModal.module.css";
import Modal from "../../common/Modal/Modal";
import { useParams } from "react-router-dom";
import API_ENDPOINTS from "../../../utils/constants";

export default function EditNationalityModal({prevNationality="KOR", showNationalityModal, setShowNationalityModal, onUpdate}) {
    const {userId} = useParams();
    const [countries, setCountries] = useState();
    const [selectedCountry, setSelectedCountry] = useState(prevNationality);

    useEffect(() => {
        const fetchCountries = async() => {
            try {
                const response = await api.get(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/countries/search`);
                setCountries(response.data.countries);
            } catch (err) {
                console.error("Failed to fetch countries", err);
            }
        }
        fetchCountries();
    }, []);

    const handleSubmit = async() => {
        try {
            const response = await api.put(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/nationality`, {
                userId: userId,
                nationality: selectedCountry
            })
            onUpdate(selectedCountry, response.data.nationalityName);
            setShowNationalityModal(false);
        } catch (err) {
            console.err("Failed to update nationality", err);
        }
    }

    return (
        <Modal
            show={showNationalityModal}
            onClose={() => setShowNationalityModal(false)}
            onSubmit={handleSubmit}
            heading="국적 수정"
            firstLabel="저장"
            secondLabel="취소"
        >
            <div className={styles.formGroup}>
                <div className={styles.inputWrapper}>
                    {countries && (
                        <select
                            value={selectedCountry || ""}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                            className={styles.formInput}
                        >
                            <option value="" disabled selected>국가를 선택하세요</option>
                            {countries.map((country) => (
                                <option key={country.id} value={country.id}>{country.name}</option>
                            ))}?
                        </select>
                    )}
                </div>
            </div>
        </Modal>
    );
}