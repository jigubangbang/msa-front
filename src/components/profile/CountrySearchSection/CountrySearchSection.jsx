import React, {useEffect, useState, useRef} from 'react';
import axios from 'axios';
import SearchBar from '../../common/SearchBar';
import styles from './CountrySearchSection.module.css';
import API_ENDPOINTS from '../../../utils/constants';
import { useParams } from 'react-router-dom';

export default function CountrySearchSection({handleMapUpdate, mapType="visited"}) {
    const {userId} = useParams();
    const [keyword, setKeyword] = useState('');
    const [countries, setCountries] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const wrapperRef = useRef(null);

    const fetchCountries = async () => {
        try {
            const response = await axios.get(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/countries/search`, {
                params: keyword ? {keyword} : {}
            });
            setCountries(response.data.countries);
        } catch (error) {
            console.error('Failed to fetch countries', error);
        }
    };

    const addCountry = async (countryId) => {
        try {
            const response = await axios.post(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/countries/${mapType}`, {
                userId,
                countryId
            });
            setCountries(prev => 
                prev.map(c => 
                    c.id === countryId
                    ? mapType === "visited"
                        ? { ...c, visitStatus: true }
                        : { ...c, wishStatus: true }
                    : c
                )
            );
            handleMapUpdate();
        } catch (error) {
            console.error("Failed to add country", error);
        }
    }
    const removeCountry = async (countryId) => {
        try {
            const response = await axios.delete(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/countries/${mapType}/${countryId}`, {});
            setCountries(prev =>
                prev.map(c =>
                    c.id === countryId
                    ? mapType === "visited"
                        ? {...c, visitStatus: false}
                        : {...c, wishStatus: false}
                    : c
                )
            );
            handleMapUpdate();
        } catch (error) {
            console.error("Failed to remove country", error);
        }
    }

    useEffect(() => {
        if (keyword.trim() !== '') {
            fetchCountries(keyword);
            setShowDropdown(true);
        }
        fetchCountries();
    }, [keyword]);


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleInputFocus = () => {
        fetchCountries();
        setShowDropdown(true);
    }

    return (
        <div ref={wrapperRef} className={styles.wrapper}>
            <SearchBar
                placeholder="국가명을 입력하세요"
                onSearchChange={setKeyword}
                onFocus={handleInputFocus}
                barWidth="300px"
            />
            {showDropdown && countries.length > 0 && (
                <div className={styles.countryList}>
                    {countries.map((country) => (
                        <div key={country.id} className={styles.countryItem}>
                            {country.name}
                            {mapType === "visited" && country.visitStatus && (
                                <button
                                    className={`${styles.btn} ${styles.btnOutline}`}
                                    onClick={() => removeCountry(country.id)}
                                >
                                    -
                                </button>
                            )}
                            {mapType === "visited" && !country.visitStatus && (
                                <button
                                    className={`${styles.btn} ${styles.btnSecondary}`}
                                    onClick={() => addCountry(country.id)}
                                >
                                    +
                                </button>
                            )}
                            {mapType === "wishlist" && country.wishStatus && (
                                <button
                                    className={`${styles.btn} ${styles.btnOutline}`}
                                    onClick={() => removeCountry(country.id)}
                                >
                                    -
                                </button>
                            )}
                            {mapType === "wishlist" && !country.wishStatus && (
                                <button
                                    className={`${styles.btn} ${styles.btnSecondary}`}
                                    onClick={() => addCountry(country.id)}>
                                    +
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}