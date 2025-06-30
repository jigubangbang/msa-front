import React, { useEffect, useState } from "react";
import { useRef } from "react";
import styles from "./Map.module.css";
import ToggleBtn from "../../components/common/ToggleBtn";
import lockIcon from "../../assets/profile/lock_white.svg";
import shareIcon from "../../assets/profile/share_grey.svg";

import Map from "./Map";
import geography from "../../../src/assets/features.json";
import { geoCentroid } from "d3-geo";
import { feature } from "topojson-client"; 
import MutatingLoadingSpinner from "../../components/common/MutatingLoadingSpinner";
import CountrySearchSection from "../../components/profile/CountrySearchSection/CountrySearchSection";
import API_ENDPOINTS from "../../utils/constants";
import { useParams } from "react-router-dom";

// TODO: Condition lock icon on premium membership
// TODO: Condition country color on visited countries data
// TODO: Search bar: Add onChange function

export default function MapPage() {
    const {userId} = useParams();
    const mapRef = useRef();
    const [selectedCountry, setSelectedCountry] = useState({id:null, name:null});
    const [mapType, setMapType] = useState("visited"); // "visited" / "wishlist"
    const [filledCountries, setFilledCountries] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

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

    const fetchVisitedCountries = async () => {
        try {
            const response = await axios.get(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/countries/${mapType}`);
            const countriesList = response.data.countries.map(c => c.countryId);
        } catch (error) {

        }
    }

    // TODO: get list of visited / wishlist countries
    useEffect(() => {
        
    }, [mapType])

    return (
        <>
            <div className={styles.mapContainer}>
                <div className={styles.btnTopLeftContainer}>
                    <CountrySearchSection mapType={mapType}/>
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
                    <button className={styles.btnOutline}>통계</button>
                    <button className={styles.btnOutline}>
                        공유 <img src={shareIcon} className={styles.icon}/>
                    </button>
                </div>
                <div className={styles.btnBottomRightContainer}>
                    <button className={styles.btnOutline} onClick={handleRandomCountry}>랜덤 추천</button>
                </div>
                <Map ref={mapRef} selectedCountry={selectedCountry} filledCountries={filledCountries}/>
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
        </>
    );
}