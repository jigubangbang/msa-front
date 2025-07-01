import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

import ProfileTemplate from "../../components/profile/ProfileTemplate";
import Map from "./Map";
import styles from './Profile.module.css';
import API_ENDPOINTS from "../../utils/constants";
import expandIcon from "../../assets/profile/expand_grey.svg";
import editIcon from "../../assets/profile/edit_grey.svg";
import LanguageModal from "../../components/profile/main/LanguageModal";

export default function Profile() {
    const {userId} = useParams();
    const [visitedCountries, setVisitedCountries] = useState([]); 
    const [userLanguages, setUserLanguages] = useState([]);
    const [userFavorites, setUserFavorites] = useState([]);
    const [showLanguageModal, setShowLanguageModal] = useState(false);

    const proficiencyMap = {
        LOW: "초급",
        INTERMEDIATE: "중급",
        HIGH: "고급",
        NATIVE: "원어민"
    }

    const fetchVisitedCountries = async () => {
        try {
            const response = await axios.get(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/countries/visited`);
            const countriesList = response.data.countries.map(c => c.countryId);
            setVisitedCountries(countriesList);
        } catch (error) {
            console.error("Failed to fetch", error);
        }
    }

    const fetchUserLanguages = async () => {
        try {
            const response = await axios.get(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/languages`);
            setUserLanguages(response.data.languages);
        } catch (error) {
            console.error("Failed to fetch languages", error);
        }
    }

    const fetchUserFavorites = async () => {
        try {
            const response = await axios.get(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/favorites`);
            setUserFavorites(response.data.countries);
        } catch (error) {
            console.error("Failed to fetch favorites", error);
        }
    }

    useEffect(() => {
        fetchVisitedCountries();
        fetchUserLanguages();
        fetchUserFavorites();
    }, []);

    return(
        <>
            <ProfileTemplate heading={`@${userId}`}>
                <div className={styles.mapContainer}>
                    <Link to={`/profile/${userId}/map`} className={`${styles.btn} ${styles.btnOutline} ${styles.expandButton}`}>
                        <img src={expandIcon} className={styles.icon}/>
                    </Link>
                    <Map filledCountries={visitedCountries}/>
                </div>
                <div className={styles.infoRow}>
                    <div className={styles.infoColumn}>
                        <div className={styles.sectionHeadingContainer}>
                            <h3 className={styles.sectionHeading}>언어</h3>
                            <button className={styles.iconButton} onClick={() => setShowLanguageModal(true)}>
                                <img src={editIcon} alt="편집" className={styles.icon}/>
                            </button>
                        </div>
                        {userLanguages.length === 0 ? (
                            <p className={styles.emptyText}>추가된 언어가 없습니다.</p>
                        ) : (
                            <ul className={styles.list}>
                                {userLanguages.map((lang) => (
                                    <li key={lang.id} className={styles.listItem}>
                                        <span>{lang.name}</span>
                                        <span className={styles.proficiency}>
                                            {proficiencyMap[lang.proficiency] ?? lang.proficiency}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className={styles.infoColumn}>
                        <div className={styles.sectionHeadingContainer}>
                            <h3 className={styles.sectionHeading}>국가 랭킹</h3>
                            <button className={styles.iconButton}>
                                <img src={editIcon} alt="편집" className={styles.icon}/>
                            </button>
                        </div>
                        {userFavorites.length === 0 ? (
                            <p className={styles.emptyText}>추가된 국가가 없습니다.</p>
                        ) : (
                            <ul className={styles.list}>
                                {userFavorites.map((country) => (
                                    <li key={country.id} className={styles.listItem}>
                                        <span>{country.name}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </ProfileTemplate>
            {
                showLanguageModal && (
                    <LanguageModal userId={userId} onClose={() => setShowLanguageModal(false)}/>
                )
            }
        </>
    );
}