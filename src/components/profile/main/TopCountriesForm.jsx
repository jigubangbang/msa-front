// TopCountriesForm.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "../../common/Modal/Modal";
import API_ENDPOINTS from "../../../utils/constants";
import { useParams } from "react-router-dom";
import styles from "./ProfileModal.module.css";
import trashIcon from "../../../assets/profile/trash_grey.svg";


export default function TopCountriesForm({ showTopCountriesForm, setShowTopCountriesForm, initialCountries, onUpdate }) {
    const {userId} = useParams();
    const [countriesList, setCountriesList] = useState([]);
    const [selectedCountries, setSelectedCountries] = useState(Array(5).fill(""));
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchCountries = async () => {
            try {
            const response = await axios.get(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/countries/search`);
            setCountriesList(response.data.countries);
        } catch (error) {
            console.error("Failed to fetch countries", error);
        }
        };
        fetchCountries();
    }, []);

    useEffect(() => {
        if (initialCountries && initialCountries.length > 0) {
            const updated = Array(5).fill("");
            initialCountries.forEach(item => {
                updated[item.countryRank - 1] = item.countryId;
            });
            setSelectedCountries(updated);
        }
    }, [initialCountries]);

    const handleCountryChange = (index, countryId) => {
        setSelectedCountries(prev => {
            const updated = [...prev];
            updated[index] = countryId;
            return updated;
        });
    };

    const handleRemoveCountry = (index) => {
        setSelectedCountries(prev => {
            const updated = [...prev];
            updated[index] = "";
            return updated;
        });
    };

    const handleSubmit = async () => {
        const payload = selectedCountries
            .map((countryId, idx) => countryId ? ({ countryRank: idx + 1, countryId }) : null)
            .filter(item => item !== null);

        try {
            setIsSubmitting(true);
            await axios.post(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/favorites`, payload);
            const response = await axios.get(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/favorites`);
            onUpdate(response.data.countries);
            setShowTopCountriesForm(false);
        } catch (err) {
            console.error("Failed to update top countries", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            show={showTopCountriesForm}
            onClose={() => setShowTopCountriesForm(false)}
            onSubmit={handleSubmit}
            heading="TOP 5 국가 설정"
            firstLabel={isSubmitting ? "저장 중..." : "저장"}
            secondLabel="취소"
            disableSubmit={isSubmitting}
        >
            <div className={styles.formContainer}>
                {Array.from({ length: 5 }, (_, idx) => (
                    <div key={idx} className={styles.formGroup}>
                        <label>{idx + 1}위</label>
                        <div className={styles.inputWrapper}>
                            <select
                                value={selectedCountries[idx]}
                                onChange={(e) => handleCountryChange(idx, e.target.value)}
                                className={styles.formInput}
                            >
                                <option value="">국가 선택</option>
                                {countriesList.map((country) => (
                                    <option
                                        key={country.id}
                                        value={country.id}
                                        disabled={selectedCountries.includes(country.id) && selectedCountries[idx] !== country.id}
                                    >
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                            {selectedCountries[idx] && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveCountry(idx)}
                                    className={styles.iconButton}
                                >
                                    <img src={trashIcon} alt="삭제" className={styles.icon}/>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Modal>
    );
}
