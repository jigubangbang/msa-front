import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { findFlagUrlByIso3Code } from 'country-flags-svg';
import styles from "./ProfileSidebar.module.css";
import locationIcon from "../../assets/profile/location_grey.svg";
import cakeIcon from "../../assets/profile/cake_grey.svg";
import planeIcon from "../../assets/profile/plane_grey.svg";
//import API_ENDPOINTS from ''

// TODO: add backend update travel status on modal click
// TODO: add backend for follow button
// TODO: redirect travel style to details page

export default function ProfileSidebar() {
    const {userId} = useParams();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [travelStatus, setTravelStatus] = useState('TRAVELING');
    const [showModal, setShowModal] = useState(false);


    const statusClasses = {
        TRAVELING: styles.statusTraveling,
        PLANNING: styles.statusPlanning,
        RESTING: styles.statusResting
    };

    const statusOptions = [
        {label: 'TRAVELING', color: '#4ade80'},
        {label: 'PLANNING', color: '#DC143C'},
        {label: 'RESTING', color: '#6b6b6b'}
    ]


    useEffect(() => {
        axios
            //.get(`https://d4f21666-0966-4b15-b291-99b17adce946.mock.pstmn.io/users/aaa`)
            .get(`http://localhost:8080/api/profile/${userId}`)
            .then((response) => {
                setData(response.data);
                console.log(response)
                setTravelStatus(response.data.travelStatus);
                console.log("testing:")
                console.log(response.data.travelStatus)
                setLoading(false);
            })
            .catch((err) => {
                console.log(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className={styles.sidebar}></div>;
    return (
        <div className={styles.sidebar}>
            <div className={styles.container}>
                <div className={styles.profileImageWrapper}>
                    <img
                        className={styles.profileImage}
                        src={data.profileImage}
                        alt="Profile"
                    />
                    <div className={styles.statusContainer}
                        onMouseEnter={() => setShowModal(true)}
                        onClick={() => setShowModal(!showModal)}
                    >
                        <button className={`${styles.travelStatus} ${statusClasses[travelStatus]}`}>
                            {travelStatus}
                        </button>
                        {showModal && (
                            <div className={styles.statusModal}>
                                {statusOptions.map((option) => (
                                    <div 
                                        key = {option.label}
                                        className = {styles.statusOption}
                                        onClick = {() => {
                                            setTravelStatus(option.label);
                                            setShowModal(false);
                                        }}
                                    >
                                        <span className={styles.statusDot} style={{backgroundColor: option.color}}></span>
                                        <span className={styles.statusText}>{option.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <span className={styles.nickname}>{data.nickname}<img className={styles.flagIcon} src={findFlagUrlByIso3Code(data.nationality)} alt="flag"/></span>
                <p className={styles.userId}>@{data.userId}</p>
                
                <div className={styles.buttons}>
                    <button className={styles.followButton}>팔로우</button>
                </div>

    

                <div className={styles.location}>
                    <img src={locationIcon}/>
                    {data.nationalityName}
                </div>
                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <div className={styles.label}>팔로잉</div>
                        <div className={styles.value}>{data.followingCount}</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.label}>팔로워</div>
                        <div className={styles.value}>{data.followerCount}</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.label}>방문 국가</div>
                        <div className={styles.value}>{data.countryVisitCount}</div>
                    </div>
                </div>
            </div>
            
            <div className={styles.extraInfoContainer}>
                <div className={styles.bioSection}>
                    <h3>소개글</h3>
                    <p className={styles.bio}>{data.bio}</p>
                </div>

                <div className={styles.inlineRow}>
                    <div className={styles.infoBlock}>
                        <h4><img src={cakeIcon} alt="가입일" />가입일</h4>
                        <p>{data.createdAt}</p>
                    </div>
                    <div className={styles.infoBlock}>
                        <h4><img src={planeIcon}/>여행성향</h4>
                        <p>
                            <span className={styles.travelBadge}>{data.travelStyleName}</span>
                        </p>
                    </div>
                </div>

                <div className={styles.inlineRow}>
                    <div className={styles.infoBlock}>
                        <h4>LEVEL</h4>
                        <p>{data.level}</p>
                    </div>
                    <div className={styles.infoBlock}>
                        <h4>XP</h4>
                        <p>{data.xp}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}