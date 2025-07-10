import { useParams } from "react-router-dom";
import api from "../../../apis/api";
import API_ENDPOINTS from "../../../utils/constants";
import { useEffect, useState } from "react";

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import styles from "./CreateDiaryModal.module.css";

export default function PostInfoStep({setPostInfo, title, publicStatus}) {
    const {userId} = useParams();

    const [countries, setCountries] = useState();
    const [cities, setCities] = useState();

    const [selectedCountry, setSelectedCountry] = useState();
    const [selectedCity, setSelectedCity] = useState();
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const fetchCountries = async() => {
        try {
            const response = await api.get(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/countries/search`);
            setCountries(response.data.countries);
        } catch (err) {
            console.error("Failed to fetch countries", err);
        }
    }

    const fetchCities = async() => {
        try {
            const response = await api.get(`${API_ENDPOINTS.MYPAGE.PROFILE}/countries/${selectedCountry}/cities`);
            setCities(response.data.cities);
        } catch (err) {
            console.error("Failed to fetch cities", err);
        }
    }

    useEffect(() => {
        if(selectedCountry) fetchCities();
    }, [selectedCountry])
    
    useEffect(() => {
        fetchCountries();
    }, []);

    useEffect(() => {
        setPostInfo({
            countryId: selectedCountry,
            cityId: selectedCity,
            title: title,
            startDate: startDate,
            endDate: endDate,
            publicStatus: publicStatus
        })
    }, [selectedCountry, selectedCity, startDate, endDate, title, publicStatus])

    return (
        <>
            <div className={styles.formGroup}>
                <label>나라 *</label>
                <div className={styles.inputWrapper}>
                    {countries && (
                        <select
                            value={selectedCountry || ""}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                            className={styles.formInput}
                            required
                        >
                            <option value="" disabled selected>국가를 선택하세요</option>
                            {countries.map((country) => (
                                <option key={country.id} value={country.id}>{country.name}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>
            <div className={styles.formGroup}>
                <label>도시</label>
                <div className={styles.inputWrapper}>
                    <select
                        value={selectedCity || ""}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className={styles.formInput}
                    >
                        <option value="" disabled selected>도시를 선택하세요</option>
                        {cities && cities.map((city) => (
                            <option key={city.id} value={city.id}>{city.cityName}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className={styles.formGroup}>
            <div className={styles.row}>
                <div className={styles.column}>
                    <label>시작일</label>
                    <div className={styles.inputWrapper}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                value={startDate}
                                onChange={(newStartDate) => setStartDate(newStartDate)}
                            />
                        </LocalizationProvider>
                    </div>
                </div>
                <div className={styles.column}>
                    <label>종료일</label>
                    <div className={styles.inputWrapper}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                value={endDate}
                                onChange={(newEndDate) => setEndDate(newEndDate)}
                            />
                        </LocalizationProvider>
                    </div>
                </div>
            </div>
        </div>

        </>
    );
}