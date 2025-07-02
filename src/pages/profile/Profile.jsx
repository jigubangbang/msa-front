import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

import ProfileTemplate from "../../components/profile/ProfileTemplate";
import Map from "./Map";
import styles from './Profile.module.css';
import API_ENDPOINTS from "../../utils/constants";
import expandIcon from "../../assets/profile/expand_grey.svg";
import addIcon from "../../assets/profile/add_grey.svg";
import editIcon from "../../assets/profile/edit_grey.svg";
import trashIcon from "../../assets/profile/trash_grey.svg";
import AddLanguageModal from "../../components/profile/main/AddLanguageModal";
import EditLanguageModal from "../../components/profile/main/EditLanguageModal";
import DeleteLanguageModal from "../../components/profile/main/DeleteLanguageModal";

export default function Profile() {
    // TODO: condition edit / add languages on session user
    // TODO: condition add top country on max limit
    const {userId} = useParams();
    const [visitedCountries, setVisitedCountries] = useState([]); 
    const [userLanguages, setUserLanguages] = useState([]);
    const [userFavorites, setUserFavorites] = useState([]);

    const [showAddLanguageModal, setShowAddLanguageModal] = useState(false);
    const [showEditLanguageModal, setShowEditLanguageModal] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState(null);
    const [showDeleteLanguageModal, setShowDeleteLanguageModal] = useState(false);

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

    function handleAddLanguage(newLanguage) {
        setUserLanguages((prev) => [...prev, newLanguage]);
    }

    function handleEditLanguage(id, newProficiency) {
        setUserLanguages((prev) => 
            prev.map((lang) => 
                lang.id === id
                ? {...lang, proficiency: newProficiency}
                : lang
            )
        );
    }

    function handleDeleteLanguage(deletedLanguageId) {
        setUserLanguages((prev) =>
            prev.filter(lang => lang.id !== deletedLanguageId)
        );
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
                            <button className={styles.iconButton} onClick={() => setShowAddLanguageModal(true)}>
                                <img src={addIcon} alt="추가" className={styles.icon}/>
                            </button>
                        </div>
                        {userLanguages.length === 0 ? (
                            <p className={styles.emptyText}>추가된 언어가 없습니다.</p>
                        ) : (
                            <ul className={styles.list}>
                                {userLanguages.map((lang) => (
                                    <li key={lang.id} className={styles.listItem}>
                                        <span>{lang.name}</span>
                                        <div>
                                            <span className={styles.proficiency}>
                                                {proficiencyMap[lang.proficiency] ?? lang.proficiency}
                                            </span>
                                            <button
                                                className={styles.iconButton}
                                                onClick={() => {
                                                    setSelectedLanguage(lang);
                                                    setShowEditLanguageModal(true);
                                                }}
                                            >
                                                <img src={editIcon} alt="편집" className={styles.icon}/>
                                            </button>
                                            <button
                                                className={styles.iconButton}
                                                onClick={() => {
                                                    setSelectedLanguage(lang);
                                                    setShowDeleteLanguageModal(true);
                                                }}
                                            >
                                                <img src={trashIcon} alt="삭제" className={styles.icon}/>
                                            </button>
                                        </div>
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
                showAddLanguageModal && (
                    <AddLanguageModal 
                        showAddLanguageModal={showAddLanguageModal}
                        setShowAddLanguageModal={setShowAddLanguageModal}
                        onSubmit={handleAddLanguage}
                    />
                )
            }
            {
                showEditLanguageModal && (
                    <EditLanguageModal
                        selectedLanguage={selectedLanguage}
                        showEditLanguageModal={showEditLanguageModal}
                        setShowEditLanguageModal={setShowEditLanguageModal}
                        onSubmit={handleEditLanguage}
                    />
                )
            }
            {
                showDeleteLanguageModal && (
                    <DeleteLanguageModal
                        selectedLanguage={selectedLanguage}
                        showDeleteLanguageModal={showDeleteLanguageModal}
                        setShowDeleteLanguageModal={setShowDeleteLanguageModal}
                        onSubmit={handleDeleteLanguage}
                    />
                )
            }
        </>
    );
}