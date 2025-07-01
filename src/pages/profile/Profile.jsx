import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

import ProfileTemplate from "../../components/profile/ProfileTemplate";
import Map from "./Map";
import styles from './Profile.module.css';
import API_ENDPOINTS from "../../utils/constants";
import expandIcon from "../../assets/profile/expand_grey.svg";

export default function Profile() {
    const {userId} = useParams();
    const [visitedCountries, setVisitedCountries] = useState([]); 

    const fetchVisitedCountries = async () => {
        try {
            const response = await axios.get(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/countries/visited`);
            const countriesList = response.data.countries.map(c => c.countryId);
            setVisitedCountries(countriesList);
        } catch (error) {
            console.error("Failed to fetch", error);
        }
    }

    useEffect(() => {
        fetchVisitedCountries();
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
            </ProfileTemplate>
        </>
    );
}