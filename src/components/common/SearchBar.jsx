import React, {useState} from 'react';
import styles from './SearchBar.module.css';
import search_icon from '../../assets/common/search_grey.svg';
import search_clear_icon from '../../assets/common/close.svg';

export default function SearchBar({placeholder="", title, onSearchChange=() => {}, recommended=[], barWidth="100%"}) {
    const [searchValue, setSearchValue] = useState('');
    
    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchValue(value);
        onSearchChange(value);
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
                    className={styles.searchInput}
                    onChange={handleInputChange}
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