import React, { useEffect, useState, useRef } from "react";
import api from "../../apis/api";

import styles from "./Map.module.css";
import ToggleBtn from "../../components/common/ToggleBtn";
import lockIcon from "../../assets/profile/lock_grey.svg";
import shareIcon from "../../assets/profile/share_grey.svg";
import SearchBar from "../../components/common/SearchBar";
import settingsIcon from "../../assets/profile/settings_grey.svg";

import Map from "./Map";
import geography from "../../../src/assets/features.json";
import { geoCentroid } from "d3-geo";
import { feature } from "topojson-client"; 
import MutatingLoadingSpinner from "../../components/common/MutatingLoadingSpinner";
import CountrySearchSection from "../../components/profile/CountrySearchSection/CountrySearchSection";
import API_ENDPOINTS from "../../utils/constants";
import { useNavigate, useParams } from "react-router-dom";
import StatsModal from "../../components/profile/map/StatsModal";
import Modal from "../../components/common/Modal/Modal";
import MapSettingsContent from "../../components/profile/map/MapSettingsContent";
import PremiumModal from "../../components/common/Modal/PremiumModal";
import { jwtDecode } from "jwt-decode";


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
    const [showPremiumConfirmModal, setShowPremiumConfirmModal] = useState(false);

    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [selectedColor, setSelectedColor] = useState();
    const [originalColor, setOriginalColor] = useState();

    const [showShareModal, setShowShareModal] = useState(false);

    const navigate = useNavigate();

    const handleRandomCountry = () => {
        if (!isPremium) {
            setShowPremiumConfirmModal(true);
            return;
        }

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

    const handleShareBtnClick = async() => {
        const shareUrl = `${window.location.origin}/map/${userId}`;
        await navigator.clipboard.writeText(shareUrl);
        setShowShareModal(true);
    }

    const handleStatsClick = () => {
        setShowStats(!showStats);
    }

    const fetchFilledCountries = async () => {
        try {
            const response = await api.get(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/countries/${mapType}`);
            const countriesList = response.data.countries.map(c => c.countryId);
            setFilledCountries(countriesList);
        } catch (error) {
            console.error("Failed to fetch", error);
        }
    }

    function getHexCode(color) {
        switch (color) {
            case 'GREEN':
                return "#93AD28";
            case 'PINK':
                return "#FFB6C1";
            case 'YELLOW':
                return "#F1DC81";
            default:
                return "#83D9E0";
        }
    }

    const fetchUserData = async () => {
        try {
            const response = await api.get(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}`);
            setIsPremium(response.data.premium); 
            setSelectedColor(response.data.mapColor);
            setOriginalColor(response.data.mapColor);
            const color = getHexCode(response.data.mapColor);
            setMapColor(color);
        } catch (error) {
            console.error("Failed to fetch user", error);
        }
    }

    function handleMapUpdate() {
        fetchFilledCountries();
    }

    const handleSettingsBtnClick = () => {
        if (!isPremium) {
            setShowPremiumConfirmModal(true);
            return;
        }
        setShowSettingsModal(true);
    };

    function handleColorSubmit() {
        api
            .put(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/map/settings?color=${selectedColor}`)
            .then((response) => {
                setOriginalColor(response.data.color);
                const color = getHexCode(response.data.color);
                setMapColor(color);
                setShowSettingsModal(false);
            })
            .catch((error) => {
                console.error("Failed to update map color", error);
            })
    }

    function resetColorSettings() {
        setSelectedColor(originalColor);
        setShowSettingsModal(false);
    }

    const onToggle= (selectedOption) => {
        if (!isPremium) {
            setShowPremiumConfirmModal(true);
            return;
        }
        setMapType(selectedOption);
    }

    useEffect(() => {
        fetchFilledCountries();
    }, [mapType, userId]);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            const decoded = jwtDecode(token);
            if (decoded.sub != userId) navigate("/");
        } else {
            navigate("/");
        }

        fetchUserData();
    }, [userId])

    return (
        <>
            <div className={styles.mapContainer}>
                <div className={styles.btnTopLeftContainer}>
                    <CountrySearchSection mapType={mapType} handleMapUpdate={handleMapUpdate}/>
                </div>
                <div className={styles.btnTopRightContainer}>
                    <button className={styles.settingsBtn} onClick={handleSettingsBtnClick}>
                        <img src={settingsIcon} alt="설정"/>
                    </button>
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
                        onToggle={onToggle}
                        isMap={true}
                        isPremium={isPremium}
                    />
                </div>
                <div className={styles.btnBottomContainer}>
                    <button className={styles.btnOutline} onClick={handleStatsClick}>통계</button>
                    <button className={styles.btnOutline} onClick={handleShareBtnClick}>
                        공유 <img src={shareIcon} className={styles.icon}/>
                    </button>
                </div>
                <div className={styles.btnBottomRightContainer}>
                    <button className={styles.btnOutline} onClick={handleRandomCountry}>랜덤 추천</button>
                </div>
                <div className={styles.mapWrapper}>
                    <Map key={mapColor} ref={mapRef} selectedCountry={selectedCountry} filledCountries={filledCountries} fillColor={mapColor} isOwner={true}/>
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
            {showSettingsModal && (
                <Modal
                    show={showSettingsModal}
                    onClose={resetColorSettings}
                    onSubmit={handleColorSubmit}
                    heading="지도 테마"
                    firstLabel="저장"
                    secondLabel="취소"
                >
                    <MapSettingsContent
                        selectedColor={selectedColor}
                        setSelectedColor={setSelectedColor}
                    />
                </Modal>
            )}
            {showPremiumConfirmModal && (
                <PremiumModal
                    showPremiumModal={showPremiumConfirmModal}
                    setShowPremiumModal={setShowPremiumConfirmModal}
                />
            )}
            {showShareModal && (
                <Modal
                    show={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    onSubmit={() => setShowShareModal(false)}
                >
                    링크가 복사 되었습니다!
                </Modal>
            )}
        </>
    );
}