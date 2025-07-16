import styles from "./ProfileCard.module.css";
import defaultProfile from "../../../assets/default_profile.png";
import { findFlagUrlByIso3Code } from 'country-flags-svg';
import premiumIcon from "../../../assets/common/premium.svg";
import { useState } from "react";
import api from "../../../apis/api";
import API_ENDPOINTS from "../../../utils/constants";
import { Link } from "react-router-dom";

export default function ProfileCard({ user }) {
    const [followStatus, setFollowStatus] = useState(false);

    function followUser() {
        api
            .post(`${API_ENDPOINTS.MYPAGE.PROFILE}/${user.userId}/network`, null)
            .then((response) => {
                setFollowStatus(true);
            })
            .catch((err) => {
                console.error("Request failed", err);
            })
    }

    function unfollowUser() {
        api
            .delete(`${API_ENDPOINTS.MYPAGE.PROFILE}/${user.userId}/network`, null)
            .then((response) => {
                setFollowStatus(false);
            })
            .catch((err) => {
                console.error("Request failed", err);
            })
    }


    return (
        <div className={styles.card}>
            <div className={styles.profileImageWrapper}>
                <img
                    src={user.profileImage || defaultProfile}
                    alt={user.nickname}
                    className={styles.profileImage}
                />
                {user.travelStyleLabel && (
                    <div className={styles.travelStyle}>
                        {user.travelStyleLabel}
                    </div>
                )}
            </div>
            <div className={styles.userInfo}>
                <div className={styles.nicknameRow}>
                    <Link to={`/profile/${user.userId}`}>
                        <span className={styles.nickname}>{user.nickname}</span>
                    </Link>
                    {user.nationality && findFlagUrlByIso3Code(user.nationality) && <img src={findFlagUrlByIso3Code(user.nationality)} alt={user.nationality} className={styles.flag} />}
                    {user.premium && <img className={styles.premiumIcon} src={premiumIcon}/>}
                </div>
                <div className={styles.userId}>@{user.userId}</div>
                <div className={styles.bio}>{user.bio || ""}</div>
            </div>
            {followStatus && (
                <button className={styles.followButton} onClick={unfollowUser}>팔로우 취소</button>
            )}
            {!followStatus && (
                <button className={styles.followButton} onClick={followUser}>팔로우</button>
            )}
        </div>
    );
}
