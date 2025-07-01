import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

import styles from "./Map.module.css";
import ToggleBtn from "../../components/common/ToggleBtn";
import lockIcon from "../../assets/profile/lock_grey.svg";
import shareIcon from "../../assets/profile/share_grey.svg";

import Map from "./Map";
import geography from "../../../src/assets/features.json";
import { geoCentroid } from "d3-geo";
import { feature } from "topojson-client"; 
import MutatingLoadingSpinner from "../../components/common/MutatingLoadingSpinner";
import CountrySearchSection from "../../components/profile/CountrySearchSection/CountrySearchSection";
import API_ENDPOINTS from "../../utils/constants";
import { useParams } from "react-router-dom";
import StatsModal from "../../components/profile/map/StatsModal";

// TODO: Condition lock icon on premium membership

export default function MapPage() {
    const {userId} = useParams();
    const mapRef = useRef();
    const [selectedCountry, setSelectedCountry] = useState({id:null, name:null});
    const [mapType, setMapType] = useState("visited"); // "visited" / "wishlist"
    const [filledCountries, setFilledCountries] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showStats, setShowStats] = useState(false);

    const [mapColor, setMapColor] = useState("white");
    const [isPremium, setIsPremium] = useState(false);

    const handleRandomCountry = () => {
        const countries = feature(geography, geography.objects.world).features;
        const random = countries[Math.floor(Math.random() * countries.length)];
        const centroid = geoCentroid(random);

        setIsLoading(true);
        setTimeout(() => {
            mapRef.current?.zoomToCountry(centroid, random.properties.name);
            setSelectedCountry({id:random.id, name:random.properties.name});
            setIsLoading(false);
        }, 3000);
    }; 

    const handleStatsClick = () => {
        setShowStats(!showStats);
    }

    const fetchFilledCountries = async () => {
        try {
            const response = await axios.get(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/countries/${mapType}`);
            const countriesList = response.data.countries.map(c => c.countryId);
            setFilledCountries(countriesList);
        } catch (error) {
            console.error("Failed to fetch", error);
        }
    }

    const fetchUserData = async () => {
        try {
            const response = await axios.get(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}`);
            setIsPremium(response.data.premium); 
            switch (response.data.mapColor) {
                    case 'GREEN':
                        setMapColor("#93AD28");
                        break;
                    case 'PINK':
                        setMapColor("#FFB6C1");
                        break;
                    case 'YELLOW':
                        setMapColor("#F1DC81");
                        break;
                    default:
                        setMapColor("#83D9E0");
                }
        } catch (error) {
            console.error("Failed to fetch user", error);
        }
    }

    function handleMapUpdate() {
        fetchFilledCountries();
    }

    useEffect(() => {
        fetchUserData();
        fetchFilledCountries();
    }, [mapType])

    return (
        <>
            <div className={styles.mapContainer}>
                <div className={styles.btnTopLeftContainer}>
                    <CountrySearchSection mapType={mapType} handleMapUpdate={handleMapUpdate}/>
                </div>
                
                <div className={styles.btnTopContainer}>
                    <ToggleBtn 
                        firstOption="방문 국가"
                        secondOption={
                            <span className={styles.optionContent}>
                                <img src={lockIcon} className={styles.icon}/>희망 국가
                            </span>
                        }
                        firstValue = "visited"
                        secondValue = "wishlist"
                        onToggle={(selectedOption) => {
                            setMapType(selectedOption);
                        }}
                    />
                </div>
                <div className={styles.btnBottomContainer}>
                    <button className={styles.btnOutline} onClick={handleStatsClick}>통계</button>
                    <button className={styles.btnOutline}>
                        공유 <img src={shareIcon} className={styles.icon}/>
                    </button>
                </div>
                <div className={styles.btnBottomRightContainer}>
                    <button className={styles.btnOutline} onClick={handleRandomCountry}>랜덤 추천</button>
                </div>
                <div className={styles.mapWrapper}>
                    <Map ref={mapRef} selectedCountry={selectedCountry} filledCountries={filledCountries}/>
                </div>
            </div>
            {isLoading && (
                <div className={styles.loadingOverlay}>
                    <MutatingLoadingSpinner
                        visible={true}
                        height="100"
                        width="100"
                        radius="12.5"
                        ariaLabel="mutating-dots-loading"
                    />
                    <p className={styles.loadingText}>Searching...</p>
                </div>
            )}
            {showStats && (
                <StatsModal userId={userId} onClose={() => setShowStats(false)} mapColor={mapColor}/>
            )}
        </>
    );
}