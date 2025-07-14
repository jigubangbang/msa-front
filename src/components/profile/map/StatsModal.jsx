import React, { useEffect, useState } from "react";
import styles from "./StatsModal.module.css";
import api from "../../../apis/api";
import API_ENDPOINTS from "../../../utils/constants";
import CirclesSpinner from "../../common/Spinner/CirclesSpinner";

export default function StatsModal({ onClose, userId, mapColor="white" }) {
    const [stats, setStats] = useState();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api
            .get(`${API_ENDPOINTS.MYPAGE.PUBLIC}/${userId}/countries/stats`)
            .then((response) => {
                setStats(response.data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Failed to fetch data", error.message);
            });
    }, []);

    if (isLoading) {
        return (
            <div className={styles.overlay}/>
        );
    }
    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}
                style={{
                    '--modal-text-color': mapColor,
                    '--modal-accent-color': mapColor
                }}
            >
                <h2 className={styles.heading}>STATS</h2>
                <div className={styles.content}>
                    <div className={styles.row}>
                        <span>방문 국가</span>
                        <span>{stats.totalVisited ?? 0} / {stats.totalCountries ?? 0}</span>
                    </div>
                    <div className={styles.row}>
                        <span>백분위</span>
                        <span>{stats.percentile ?? 0}%</span>
                    </div>

                    <div className={styles.section}>
                        {stats.continents && Object.entries(stats.continents).map(([key, region]) => (
                            <div key={key} className={styles.regionRow}>
                                <div className={styles.regionLabel}>
                                    <span>{region.continent_ko}</span>
                                    <span>{region.visited ?? 0} / {region.total ?? 0}</span>
                                </div>
                                <div className={styles.progressBar}>
                                    <div
                                        className={styles.progressFill}
                                        style={{ width: `${region.percentage ?? 0}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <button className={styles.closeButton} onClick={onClose}>닫기</button>
            </div>
        </div>
    );
}
