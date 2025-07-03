import { useEffect, useState } from "react";
import ProfileTemplate from "../../components/profile/ProfileTemplate";
import { Link, useParams } from "react-router-dom";
import api from "../../apis/api";
import API_ENDPOINTS from "../../utils/constants";
import styles from "./Network.module.css";
import Pagination from "../../components/common/Pagination/Pagination";
import defaultProfile from "../../assets/default_profile.png";
import premiumIcon from "../../assets/common/premium.svg";

export default function Network({type}) {
    const {userId} = useParams();
    const [list, setList] = useState([]);
    const [total, setTotal] = useState(0);
    const pageSize = 10;
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchFollowing = async() => {
            try {
                const offset = (currentPage - 1) * pageSize;
                const response = await api.get(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/network?type=${type}&pageSize=${pageSize}&offset=${offset}`);
                setList(response.data.list);
                setTotal(response.data.total);
            } catch (error) {
                console.error("Failed to fetch data", error);
            }
        }
        fetchFollowing();
    }, [userId, currentPage, type]);

    if (total === 0) {
        return (
            <ProfileTemplate isNetwork={true}>
                <p>팔로우 하는 회원이 없습니다.</p>
            </ProfileTemplate>
        )
    }

    return (
        <ProfileTemplate isNetwork={true}>
           {list && (
                <div>
                {list.map((user) => (
                    <Link to={`/profile/${user.userId}`}>
                        <div
                            key={user.userId}
                            className={styles.userCard}
                            onClick={() => navigate(`/profile/${user.userId}`)}
                        >
                            <img
                                src={user.profile_image || defaultProfile}
                                alt="profile"
                                className={styles.profileImage}
                            />
                            <div className={styles.userInfo}>
                                <div className={styles.nicknameRow}>
                                    {user.nickname}
                                    {user.premium && (
                                        <img className={styles.premiumIcon} src={premiumIcon}/>
                                    )}
                                </div>
                                <div className={styles.statsRow}>
                                    팔로워 {user.followerCount} · 팔로잉 {user.followingCount} · 방문국 {user.countryVisitCount}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
                </div>
            )}
            {total > pageSize && (
                <Pagination
                    currentPage={currentPage}
                    pageCount={Math.ceil(total/pageSize)}
                    onPageChange={(page) => setCurrentPage(page)}
                />
            )}
        </ProfileTemplate>
    );
}