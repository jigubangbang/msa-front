import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../../apis/api";
import API_ENDPOINTS from "../../../utils/constants";
import styles from "./TravelStyle.module.css";
import cameraIcon from "../../../assets/feed/travel-style/camera_grey.svg";
import clockIcon from "../../../assets/feed/travel-style/clock_grey.svg";
import compatibleIcon from "../../../assets/feed/travel-style/compatible_grey.svg";
import foodIcon from "../../../assets/feed/travel-style/food_grey.svg";
import incompatibleIcon from "../../../assets/feed/travel-style/incompatible_grey.svg";
import keywordIcon from "../../../assets/feed/travel-style/keyword_grey.svg";
import luggageIcon from "../../../assets/feed/travel-style/luggage_grey.svg";
import travelIcon from "../../../assets/feed/travel-style/travel_grey.svg";

export default function TravelStyle() {
    const [styleList, setStyleList] = useState([]);
    const navigate = useNavigate();

    const {id} = useParams();
    const [style, setStyle] = useState();
    const [compatibleStyles, setCompatibleStyles] = useState([]);
    const [incompatibleStyles, setIncompatibleStyles] = useState([]);

    useEffect(() => {
        const fetchStyleList = async () => {
            try {
                const response = await api.get(`${API_ENDPOINTS.STYLE.PUBLIC}/styles`);
                setStyleList(response.data.styles);
            } catch (err) {
                console.error("Failed to fetch styles", err);
            }
        }
        fetchStyleList();
    }, []);

    useEffect(() => {
        const fetchStyleDetail = async () => {
            if (!id) return;
            try {
                const response = await api.get(`${API_ENDPOINTS.STYLE.PUBLIC}/styles/${id}`);
                setStyle(response.data.style);
                setCompatibleStyles(response.data.compatibleStyles);
                setIncompatibleStyles(response.data.incompatibleStyles);
            } catch (err) {
                console.error("Failed to fetch detail", err);
            }
        }
        fetchStyleDetail();
    }, [id]);

    return (
        <div className={styles.outerContainer}>
            {styleList && (
                <div className={styles.headerWrapper}>
                    {styleList.map((item) => (
                        <button key={item.id} className={`${styles.menuBtn} ${(item.id == id) ? styles.active : ""}`}>
                            <Link to={`/feed/travel-style/${item.id}`}>
                                {item.id}. {item.label}
                            </Link>
                        </button>
                    ))}
                </div>
            )}
            <div className={styles.contentWrapper}>
                {style && (
                    <>
                        <h2 className={styles.title}>{style.id}. {style.label}</h2>
                        <div className={styles.section}>
                            <p className={styles.summary}>{style.description}</p>
                        </div>
                        {style.image && <img src={style.image} className={styles.image}/>}
                        <div className={styles.cardBox}>
                            <div className={styles.headerWithIcon}>
                                <img src={keywordIcon} alt="키워드"/>
                                <h3 className={styles.sectionHeader}>핵심 키워드</h3>
                            </div>
                            <p className={styles.keywords}>{style.keyword}</p>
                        </div>
                        <div className={styles.cardBox}>
                            <div className={styles.infoBlock}>
                                <div className={styles.headerWithIcon}>
                                    <img src={travelIcon} alt="여행 성향"/>
                                    <h3 className={styles.sectionHeader}>여행 성향</h3>
                                </div>
                                <p className={styles.info}>{style.travelPreference}</p>
                            </div>
                            <div className={styles.infoBlock}>
                                <div className={styles.headerWithIcon}>
                                    <img src={clockIcon} alt="여행 루틴"/>
                                    <h3 className={styles.sectionHeader}>여행 루틴</h3>
                                </div>
                                <p className={styles.info}>{style.travelRoutine}</p>
                            </div>
                            <div className={styles.infoBlock}>
                                <div className={styles.headerWithIcon}>
                                    <img src={foodIcon} alt="음식 취향"/>
                                    <h3 className={styles.sectionHeader}>음식 취향</h3>
                                </div>
                                <p className={styles.info}>{style.foodPreference}</p>
                            </div>
                            <div className={styles.infoBlock}>
                                <div className={styles.headerWithIcon}>
                                    <img src={cameraIcon} alt="SNS 스타일"/>
                                    <h3 className={styles.sectionHeader}>SNS 스타일</h3>
                                </div>
                                <p className={styles.info}>{style.snsStyle}</p>
                            </div>
                            <div className={styles.infoBlock}>
                                <div className={styles.headerWithIcon}>
                                    <img src={luggageIcon} alt="여행 짐"/>
                                    <h3 className={styles.sectionHeader}>여행 짐 특징</h3>
                                </div>
                                <p className={styles.info}>{style.packingStyle}</p>
                            </div>
                        </div>
                    </>
                )}
                <>
                {compatibleStyles.length > 0 && (
                    <div className={styles.section}>
                        <div className={styles.headerWithIcon}>
                            <img src={compatibleIcon} alt="궁합"/>
                            <h3 className={styles.sectionHeader}>궁합이 좋은 여행 파트너</h3>
                        </div>
                        <div className={styles.cardGrid}>
                            {compatibleStyles.map((item) => (
                                <div key={item.partnerTravelStyleId} className={styles.card} onClick={() => navigate(`/feed/travel-style/${item.partnerTravelStyleId}`)}>
                                    <img className={styles.cardImage} src={item.image} alt={item.partnerTravelStyleId}/>
                                    <p className={styles.cardTitle}>
                                        {item.partnerTravelStyleId}. {item.partnerTravelStyleLabel}
                                    </p>
                                    <p className={styles.cardDescription}>{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {incompatibleStyles.length > 0 && (
                    <div className={styles.section}>
                        <div className={styles.headerWithIcon}>
                            <img src={incompatibleIcon} alt="궁합"/>
                            <h3 className={styles.sectionHeader}>충돌 가능성이 큰 타입</h3>
                        </div>
                        <div className={styles.cardGrid}>
                            {incompatibleStyles.map((item) => (
                                <div key={item.partnerTravelStyleId} className={styles.card} onClick={() => navigate(`/feed/travel-style/${item.partnerTravelStyleId}`)}>
                                    <img className={styles.cardImage} src={item.image} alt={item.partnerTravelStyleId}/>
                                    <p className={styles.cardTitle}>
                                        {item.partnerTravelStyleId}. {item.partnerTravelStyleLabel}
                                    </p>
                                    <p className={styles.cardDescription}>{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                </>
            </div>
        </div>
    );
}