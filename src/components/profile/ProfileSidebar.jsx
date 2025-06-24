import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { findFlagUrlByIso3Code } from 'country-flags-svg';
import styles from "./ProfileSidebar.module.css";
import locationIcon from "../../assets/profile/location_grey.svg";
import cakeIcon from "../../assets/profile/cake_grey.svg";
import planeIcon from "../../assets/profile/plane_grey.svg";
import defaultProfile from "../../assets/default_profile.png";
import API_ENDPOINTS from "../../utils/constants";

// TODO: add backend for follow button
// TODO: redirect travel style to details page
// TODO: show modal only if is logged in user's profile
// TODO: redirect follower/following stats -> network list page

export default function ProfileSidebar() {
    //const {user} = useContext(UserContext); /* Logged in user */
    const sessionUserId = "bbb";
    const {userId} = useParams();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [travelStatus, setTravelStatus] = useState('TRAVELING');
    const [followStatus, setFollowStatus] = useState(false);
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

    function updateTravelStatus(status) {
        axios
            .put(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/travel-status`, null, {
                params: {status: status}
            })
            .then((response) => {})
            .catch((err) => {
                console.error("Request failed", err);
            })
    }

    function editProfileImage() {

    }

    function followUser() {
        axios
            .post(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/network`, null)
            .then((response) => {
                setFollowStatus(true);
            })
            .catch((err) => {
                console.error("Request failed", err);
            })
    }

    function unfollowUser() {
        axios
            .delete(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/network`, null)
            .then((response) => {
                setFollowStatus(false);
            })
            .catch((err) => {
                console.error("Request failed", err);
            })
    }

    useEffect(() => {
        axios
            //.get(`https://d4f21666-0966-4b15-b291-99b17adce946.mock.pstmn.io/users/aaa`)
            .get(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}`)
            .then((response) => {
                setData(response.data);
                setTravelStatus(response.data.travelStatus);
                setFollowStatus(response.data.followStatus);
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
                    {
                        data.profileImage ? (
                            <img
                                className={styles.profileImage}
                                src={data.profileImage}
                                alt="Profile"
                            />
                        ) : (
                            <img
                                className={styles.profileImage}
                                src={defaultProfile}
                                alt="Profile"
                            />
                        )
                    }
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
                                            updateTravelStatus(option.label);
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

                <span className={styles.nickname}>
                    {data.nickname}
                    {
                        data.nationality && (
                            <img className={styles.flagIcon} src={findFlagUrlByIso3Code(data.nationality)} alt="flag"/>
                        )
                    }
                </span>
                <p className={styles.userId}>@{data.userId}</p>
                
                <div className={styles.buttons}>
                    {userId === sessionUserId && (
                        <button className={styles.followButton}>프로필 수정</button>
                    )}
                    {followStatus && (
                        <button className={styles.followButton} onClick={unfollowUser}>팔로우 취소</button>
                    )}
                    {(userId != sessionUserId && !followStatus) && (
                        <button className={styles.followButton} onClick={followUser}>팔로우</button>
                    )}
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
                        <p>{data.formattedDate}</p>
                    </div>
                    <div className={styles.infoBlock}>
                        <h4><img src={planeIcon}/>여행성향</h4>
                        <p>
                            {data.travelStyleName ? (
                                <span className={styles.travelBadge}>{data.travelStyleName}</span>
                            ) : (
                                <span>-</span>
                            )
                            }
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