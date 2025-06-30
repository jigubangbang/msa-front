import React, {useEffect, useState, useRef} from 'react';
import axios from 'axios';
import SearchBar from '../../common/SearchBar';
import styles from './CountrySearchSection.module.css';
import API_ENDPOINTS from '../../../utils/constants';
import { useParams } from 'react-router-dom';

export default function CountrySearchSection({handleMapUpdate, mapType="VISITED"}) {
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

    // TODO : onClick (add / remove countries)
    const addVisit = async () => {
        
    }
    const removeVisit = async () => {
        
    }
    const addWishlist = async () => {
        
    }
    const removeWishlist = async () => {
        
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
                            {mapType === "VISITED" && country.visitStatus && (
                                <button
                                    className={`${styles.btn} ${styles.btnOutline}`}
                                    onClick={() => addVisit(country.id)}
                                >
                                    -
                                </button>
                            )}
                            {mapType === "VISITED" && !country.visitStatus && (
                                <button
                                    className={`${styles.btn} ${styles.btnSecondary}`}
                                    onClick={() => removeVisit(country.id)}
                                >
                                    +
                                </button>
                            )}
                            {mapType === "WISHLIST" && country.wishStatus && (
                                <button
                                    className={`${styles.btn} ${styles.btnOutline}`}
                                    onClick={() => addWishlist(country.id)}
                                >
                                    -
                                </button>
                            )}
                            {mapType === "WISHLIST" && !country.wishStatus && (
                                <button
                                    className={`${styles.btn} ${styles.btnSecondary}`}
                                    onClick={() => removeWishlist(country.id)}>
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