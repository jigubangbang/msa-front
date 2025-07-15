import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../apis/api";
import API_ENDPOINTS from "../../utils/constants";
import Map from "./Map";
import styles from "./Map.module.css";
import homeIcon from "../../assets/profile/home_grey.svg";
import StatsModal from "../../components/profile/map/StatsModal";

export default function PublicMapPage() {
    const {userId} = useParams();
    const [countries, setCountries] = useState([]);
    const [mapColor, setMapColor] = useState("");
    const [showStats, setShowStats] = useState(false);
    const navigate = useNavigate();

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get(`${API_ENDPOINTS.MYPAGE.PUBLIC}/${userId}/map`);
                setCountries(response.data.countries.map(c => c.countryId));
                setMapColor(getHexCode(response.data.mapColor));
            } catch (err) {
                console.error("Failed to fetch data", err);
            }
        }
        fetchData();
    }, [userId]);

    return (
        <>
            <div className={styles.mapContainer}>
                <div className={styles.btnTopLeftContainer}>
                    <button className={styles.settingsBtn} onClick={() => navigate(`/`)}>
                        <img src={homeIcon}/>
                    </button>
                </div>
                {countries &&
                    <div className={styles.mapWrapper}>
                        <Map filledCountries={countries} fillColor={mapColor}/>
                    </div>
                }
                <div className={styles.btnBottomContainer}>
                    <button className={styles.btnOutline} onClick={() => setShowStats(!showStats)}>통계</button>
                </div>
            </div>
            {showStats && (
                <StatsModal userId={userId} onClose={() => setShowStats(false)} mapColor={mapColor}/>
            )}
        </>
    );
}