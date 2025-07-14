import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { findFlagUrlByIso3Code } from 'country-flags-svg';
import styles from "./ProfileSidebar.module.css";
import locationIcon from "../../assets/profile/location_grey.svg";
import cakeIcon from "../../assets/profile/cake_grey.svg";
import planeIcon from "../../assets/profile/plane_grey.svg";
import editIcon from "../../assets/profile/edit_grey.svg";
import defaultProfile from "../../assets/default_profile.png";
import premiumIcon from "../../assets/common/premium.svg";
import API_ENDPOINTS from "../../utils/constants";
import Modal from "../common/Modal/Modal";

import { jwtDecode } from "jwt-decode";
import api from "../../apis/api";
import EditNationalityModal from "./main/EditNationalityModal";

export default function ProfileSidebar() {
    const [sessionUserId, setSessionUserId] = useState();
    const {userId} = useParams();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profileImage, setProfileImage] = useState();
    
    const [travelStatus, setTravelStatus] = useState('TRAVELING');
    const [followStatus, setFollowStatus] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const [showEditBioModal, setShowEditBioModal] = useState(false);
    const [bio, setBio] = useState();

    const [nationality, setNationality] = useState();
    const [nationalityName, setNationalityName] = useState();
    const [showNationalityModal, setShowNationalityModal] = useState(false);


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
        api
            .put(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/travel-status`, null, {
                params: {status: status}
            })
            .then((response) => {})
            .catch((err) => {
                console.error("Request failed", err);
            })
    }

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await api.put(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setProfileImage(response.data.profileImage);
        } catch (error) {
            console.error("Upload failed", error);
        }
    };

    function handleBioSubmit() {
        api
            .put(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/bio`, {
                userId: userId,
                bio: bio
            })
            .then(() => {
                setData(prev => ({
                    ...prev,
                    bio: bio
                }))
                setShowEditBioModal(false);
            })
            .catch((error) => {
                console.error("Failed to update bio", error);
            })
    }

    function handleNationalityUpdate(newNationality, newNationalityName) {
        setNationality(newNationality);
        setNationalityName(newNationalityName);
    } 

    function followUser() {
        api
            .post(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/network`, null)
            .then((response) => {
                setFollowStatus(true);
            })
            .catch((err) => {
                console.error("Request failed", err);
            })
    }

    function unfollowUser() {
        api
            .delete(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/network`, null)
            .then((response) => {
                setFollowStatus(false);
            })
            .catch((err) => {
                console.error("Request failed", err);
            })
    }

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            const decoded = jwtDecode(token);
            setSessionUserId(decoded.sub);
        }

        api
            .get(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}`)
            .then((response) => {
                setData(response.data);
                setTravelStatus(response.data.travelStatus);
                setFollowStatus(response.data.followStatus);
                setProfileImage(response.data.profileImage);
                setBio(response.data.bio);
                setNationality(response.data.nationality);
                setNationalityName(response.data.nationalityName);
                setLoading(false);
            })
            .catch((err) => {
                console.log(err.message);
                setLoading(false);
            });
    }, [userId]);

    if (loading) return <div className={styles.sidebar}></div>;
    return (
        <div className={styles.sidebar}>
            <div className={styles.container}>
                <div className={styles.profileImageWrapper}>
                    {
                        data.profileImage ? (
                            <img
                                className={styles.profileImage}
                                src={profileImage}
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
                        {sessionUserId === userId && showModal && (
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
                    {nationality && <img className={styles.flagIcon} src={findFlagUrlByIso3Code(nationality)} alt="flag"/>}
                    {data.premium && <img className={styles.premiumIcon} src={premiumIcon}/>}
                </span>
                <p className={styles.userId}>@{data.userId}</p>
                
                <div className={styles.buttons}>
                    {userId === sessionUserId && (
                        <label className={styles.followButton}>
                            프로필 변경
                            <input 
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{display: "none"}}
                            />
                        </label>
                    )}
                    {followStatus && (
                        <button className={styles.followButton} onClick={unfollowUser}>팔로우 취소</button>
                    )}
                    {(userId != sessionUserId && !followStatus) && (
                        <button className={styles.followButton} onClick={followUser}>팔로우</button>
                    )}
                </div>

    

                <div className={styles.location}>
                    <button 
                        className={styles.editButton}
                        onClick={() => setShowNationalityModal(true)}
                    >
                        <img src={locationIcon} alt="국적 수정"/>
                    </button>
                    {nationalityName}
                </div>
                {showNationalityModal && (
                    <EditNationalityModal
                        prevNationality={nationality}
                        showNationalityModal={showNationalityModal}
                        setShowNationalityModal={setShowNationalityModal}
                        onUpdate={handleNationalityUpdate}
                    />
                )}
                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <div className={styles.label}>팔로잉</div>
                        <Link to={`/profile/${userId}/following`} className={styles.value}>
                            {data.followingCount}
                        </Link>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.label}>팔로워</div>
                        <Link to={`/profile/${userId}/followers`} className={styles.value}>
                            {data.followerCount}
                        </Link>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.label}>방문 국가</div>
                        <div className={styles.value}>{data.countryVisitCount}</div>
                    </div>
                </div>
            </div>
            
            <div className={styles.extraInfoContainer}>
                <div className={styles.bioSection}>
                    <div className={styles.bioHeader}>
                        <h3>소개글</h3>
                        {userId === sessionUserId && (
                            <button
                                className={styles.editButton}
                                onClick={() => setShowEditBioModal(true)}
                            >
                                <img src={editIcon} alt="소개글 수정"/>
                            </button>
                        )}
                    </div>
                    <p className={styles.bio}>{data.bio}</p>
                </div>
                {
                    showEditBioModal && (
                        <Modal
                            show={showEditBioModal}
                            onClose={() => setShowEditBioModal(false)}
                            onSubmit={handleBioSubmit}
                            firstLabel="저장"
                            secondLabel="취소"
                        >
                            <div className={styles.formGroup}>
                                <label>소개글</label>
                                <div className={styles.inputWrapper}>
                                    <textarea
                                        className={styles.formInput}
                                        value={bio}
                                        maxLength={120}
                                        rows={6}
                                        placeholder="소개글을 입력하세요"
                                        onChange={(e) => setBio(e.target.value)}
                                    />
                                </div>
                            </div>
                        </Modal>
                    )
                }

                <div className={styles.inlineRow}>
                    <div className={styles.infoBlock}>
                        <h4><img src={cakeIcon} alt="가입일" />가입일</h4>
                        <p>{data.formattedDate}</p>
                    </div>
                    <div className={styles.infoBlock}>
                        <h4><img src={planeIcon}/>여행성향</h4>
                        <p>
                            {data.travelStyleName ? (
                                <Link to={`/feed/travel-style/${data.travelStyleId}`}>
                                    <span className={styles.travelBadge}>{data.travelStyleName}</span>
                                </Link>
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
                {data.badge && (
                    <div className={styles.inlineRow}>
                        <div className={styles.badgeBlock}>
                            <h4>대표 뱃지</h4>
                            <Link to={`/my-quest/profile/${userId}/badges`}>
                            <div className={styles.tooltipWrapper}>
                                <img src={data.badge.icon} className={styles.pinnedBadgeIcon} alt={data.badge.title}/>
                                <span className={styles.tooltip}>{data.badge.title}</span>
                            </div>
                            </Link>
                        </div>
                    </div>
                )}
                </div>
        </div>
    );
}