import React from 'react';
import styles from './SearchBar.module.css';
import search_icon from '../../assets/common/search_grey.svg';

export default function SearchBar({
    placeholder="",
    title,
    onSearchChange = () => {},
    onFocus = () => {},
    recommended=[],
    barWidth="100%"
}) {
    return (
        <div className={styles.searchContainer}>
            <h1 className={styles.searchTitle}>{title}</h1>
            <div className={styles.searchBar} style={{width: barWidth}}>
                <img src={search_icon}/>
                <input
                    type="text"
                    placeholder={placeholder}
                    className={styles.searchInput}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onFocus={onFocus}
                />
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