import { useEffect, useState } from "react";
import styles from "./FeedFilter.module.css";
import resetIcon from "../../../assets/feed/reset_grey.svg";

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import API_ENDPOINTS from "../../../utils/constants";
import api from "../../../apis/api";

export default function FeedFilter({onSubmit, setFilter, onReset}) {
    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);

    const [selectedCountry, setSelectedCountry] = useState();
    const [selectedCity, setSelectedCity] = useState();
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedSortOption, setSelectedSortOption] = useState("recent");

    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const sortOptions = [
        {"id": "recent", "name": "최신순"},
        {"id": "like", "name": "인기순"}
    ];

    const fetchCountries = async() => {
        try {
            const response = await api.get(`${API_ENDPOINTS.FEED.PUBLIC}/countries`);
            setCountries(response.data.countries);
        } catch (err) {
            console.error("Failed to fetch countries", err);
        }
    }

    const fetchCities = async() => {
        try {
            const response = await api.get(`${API_ENDPOINTS.FEED.PUBLIC}/countries/${selectedCountry}/cities`);
            setCities(response.data.cities);
        } catch (err) {
            console.error("Failed to fetch cities", err);
        }
    }

    useEffect(() => {
        fetchCountries();
    }, []);

    useEffect(() => {
        if(selectedCountry) {
            fetchCities();
            setSelectedCity(null);
        }
    }, [selectedCountry]);
    

    useEffect(()=> {
        setFilter({
            countryId: selectedCountry,
            cityId: selectedCity,
            startDate: startDate,
            endDate: endDate,
            sort: selectedSortOption
        });
    }, [selectedCountry, selectedCity, startDate, endDate, selectedSortOption]);

    const handleReset = () => {
        setSelectedCountry(null);
        setSelectedCity(null);
        setStartDate(null);
        setEndDate(null);
        setSelectedSortOption("recent");
        onReset();
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.formGroup}>
                {/* Country Dropdown */}
                <div className={styles.dropdownWrapper}>
                    <div
                        className={styles.dropdownSelector}
                        onClick={() => setShowCountryDropdown((prev) => !prev)}
                    >
                        {selectedCountry
                            ? countries.find((c) => c.id === selectedCountry)?.name
                            : "국가 선택"}
                        <span
                            className={`${styles.arrow} ${showCountryDropdown ? styles.arrowOpen : ""}`}
                        >▼</span>
                    </div>
                    {showCountryDropdown && (
                        <div className={styles.dropdownMenu}>
                            {countries.map((country) => (
                                <div
                                    key={country.id}
                                    className={styles.dropdownItem}
                                    onClick={() => {
                                        setSelectedCountry(country.id);
                                        setShowCountryDropdown(false);
                                    }}
                                >
                                    {country.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* City Dropdown */}
                {cities.length > 0 && (
                    <div className={styles.dropdownWrapper}>
                        <div
                            className={styles.dropdownSelector}
                            onClick={() => setShowCityDropdown((prev) => !prev)}
                        >
                            {selectedCity
                                ? cities.find((c) => c.id === selectedCity)?.cityName
                                : "도시 선택"}
                            <span
                                className={`${styles.arrow} ${showCityDropdown ? styles.arrowOpen : ""}`}
                            >▼</span>
                        </div>
                        {showCityDropdown && (
                            <div className={styles.dropdownMenu}>
                                {cities.map((city) => (
                                    <div
                                        key={city.id}
                                        className={styles.dropdownItem}
                                        onClick={() => {
                                            setSelectedCity(city.id);
                                            setShowCityDropdown(false);
                                        }}
                                    >
                                        {city.cityName}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Date Pickers */}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="시작일"
                        value={startDate}
                        onChange={(newStartDate) => setStartDate(newStartDate)}
                        slotProps={{ textField: { size: 'small' } }}
                    />
                </LocalizationProvider>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="종료일"
                        value={endDate}
                        onChange={(newEndDate) => setEndDate(newEndDate)}
                        slotProps={{ textField: { size: 'small' } }}
                    />
                </LocalizationProvider>

                <div className={styles.dropdownWrapper}>
                    <div
                        className={styles.dropdownSelector}
                        onClick={() => setShowSortDropdown((prev) => !prev)}
                    >
                        {sortOptions.find((option) => option.id === selectedSortOption)?.name}
                        <span
                            className={`${styles.arrow} ${showSortDropdown ? styles.arrowOpen : ""}`}
                        >▼</span>
                    </div>
                    {showSortDropdown && (
                        <div className={styles.dropdownMenu}>
                            {sortOptions.map((option) => (
                                <div
                                    key={option.id}
                                    className={styles.dropdownItem}
                                    onClick={() => {
                                        setSelectedSortOption(option.id);
                                        setShowSortDropdown(false);
                                    }}
                                >
                                    {option.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onSubmit}>
                    적용
                </button>
                {/* Reset Button */}
                <button className={styles.resetButton} onClick={handleReset}>
                    <img src={resetIcon} alt="초기화" className={styles.resetIcon} />
                </button>
            </div>
        </div>
    );
}