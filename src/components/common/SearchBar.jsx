import React, {useState, useEffect} from 'react';
import styles from './SearchBar.module.css';
import search_icon from '../../assets/common/search_grey.svg';
import search_clear_icon from '../../assets/common/close.svg';

export default function SearchBar ({
    placeholder="",
    title,
    value="",
    onSearchChange = () => {},
    onFocus = () => {},
    recommended=[],
    barWidth="100%"
}) {
    const [searchValue, setSearchValue] = useState('');
    
    useEffect(()=>{
        setSearchValue(value);
    }, [value])

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setSearchValue(newValue);
        onSearchChange(newValue);
    }

    const handleClear = () => {
        setSearchValue('');
        onSearchChange('');
    }
    
    return (
        <div className={styles.searchContainer}>
            <h1 className={styles.searchTitle}>{title}</h1>
            <div className={styles.searchBar} style={{width: barWidth}}>
                <img src={search_icon}/>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchValue}
                    className={styles.searchInput}
                    onChange={handleInputChange}
                    onFocus={onFocus}
                />
                <img src={search_clear_icon} onClick={handleClear} alt={"cancel button"} className={styles.searchClearIcon}/>
            </div>
            {recommended.length > 0 && (
            <div className={styles.searchRecommendation}>
                <span>추천 :</span>
                {recommended.map((topic, index) => (
                <span key={index} className={styles.topic}>{topic}</span>
                ))}
            </div>
            )}
        </div>
    );
}