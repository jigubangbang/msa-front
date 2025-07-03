import api from "../../apis/api";
import ProfileTemplate from "../../components/profile/ProfileTemplate";
import { useParams } from "react-router-dom";
import API_ENDPOINTS from "../../utils/constants";
import { useState, useEffect } from "react";
import Dropdown from "../../components/common/Dropdown";
import styles from "./Countries.module.css";
import { findFlagUrlByIso3Code } from "country-flags-svg";

export default function Countries() {
    const {userId} = useParams();
    const [activeDropdownOption, setActiveDropdownOption] = useState({label: "전체", value:""});
    const [data, setData] = useState({countries: []});
    const [stats, setStats] = useState({});

    const dropdownOptions = [
        {
            label: "전체",
            value: ""
        },
        {
            label: "아시아",
            value: "Asia"
        },
        {
            label: "유럽",
            value: "Europe"
        },
        {
            label: "북아메리카",
            value: "North America"
        },
        {
            label: "남아메리카",
            value: "South America"
        },
        {
            label: "아프리카",
            value: "Africa"
        },
        {
            label: "오세아니아",
            value: "Oceania"
        },
        {
            label: "남극",
            value: "Antarctica"
        }
    ];

    function handleOptionClick(option) {
        setActiveDropdownOption(option);
    }

    useEffect(() => {
        api
            .get(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/countries/visited?continent=${activeDropdownOption.value}`)
            .then((response) => {
                setData(response.data);
            })
            .catch((err) => {
                console.error("Failed to load countries", err.message);
            });
        api
            .get(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/countries/stats`)
            .then((response) => {
                setStats(response.data);
            })
            .catch((err) => {
                console.error("Failed to load stats", err.message);
            });
    }, [activeDropdownOption, userId]);
    return (
        <ProfileTemplate heading={`@${userId}`}>
            <div className={styles.mainWrapper}>
                <div className={styles.columnLeft}>
                    <div className={styles.topControls}>
                        <Dropdown
                            options={dropdownOptions}
                            defaultOption={activeDropdownOption.label}
                            onSelect={(option) => {handleOptionClick(option)}}
                        />
                    </div>
                    <div className={styles.countryGrid}>
                        {data.countries.map((country) => (
                            <div className={styles.countryWrapper} key={country.id}>
                                <img
                                    className={styles.flagIcon} 
                                    src={findFlagUrlByIso3Code(country.countryId)}
                                />
                                <p>
                                    {country.name}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={styles.columnRight}>
                    <div className={styles.statsContainer}>
                        <div>
                            <span>전체:</span>
                            <span>{stats.totalVisited} / {stats.totalCountries}</span>
                        </div>
                        {stats.continents && Object.entries(stats.continents).map(([key, continent]) => (
                            <div key={key}>
                                <span>{continent.continent_ko}:</span>
                                <span>{continent.visited || 0} / {continent.total}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ProfileTemplate>
    );
}