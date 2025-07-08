import React, { useEffect, useState, useMemo } from 'react';
import styles from './CompactLevelChart.module.css';
import axios from 'axios'; 
import API_ENDPOINTS from '../../../utils/constants';

const CompactLevelChart = ({ userId }) => {
  const [hoveredSegment, setHoveredSegment] = useState(null);
const [data, setData] = useState([]); 
  const [total, setTotal] = useState(0); 
  const [user, setUser] = useState(null);
  const [rank, setRank] = useState(null); 
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (userId) { 
      fetchData();
    }
  },[userId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_ENDPOINTS.QUEST.PUBLIC}/user-graph`, {
        params: { user_id: userId }
      });
      
      setData(response.data.userData || []); 
      setTotal(response.data.countUser || 0); 
      setUser(response.data.user || null);
      setRank(response.data.rank || null); 
      console.log("UserInfo data fetched:", response.data);
    } catch (error) {
      console.error("Failed to fetch userInfo data:", error);
      setData([]); 
      setTotal(0);
      setUser(null);
      setRank(null);
    } finally {
      setLoading(false);
    }
  };
  

  // 현재 사용자의 레벨 찾기
  const currentUserLevel = useMemo(() => {
    if (!data || !user) return null; // data와 user 체크
    const currentUser = data.find(u => u.user_id === user);
    return currentUser ? currentUser.level : null;
  }, [data, user]);

  // 레벨 구간별 데이터 계산
  const levelDistribution = useMemo(() => {
    if (!data || data.length === 0) { 
      return [];
    }
    
    const ranges = [
      { min: 0, max: 10, label: '0-10' },
      { min: 10, max: 20, label: '10-20' },
      { min: 20, max: 30, label: '20-30' },
      { min: 30, max: 40, label: '30-40' },
      { min: 40, max: 50, label: '40-50' }
    ];

    return ranges.map(range => {
      const usersInRange = data.filter(user => 
        user.level >= range.min && user.level < range.max
      ).length;
      
      const isCurrentUserRange = currentUserLevel !== null && 
        currentUserLevel >= range.min && currentUserLevel < range.max;
      
      return {
        ...range,
        count: usersInRange,
        percentage: total > 0 ? (usersInRange / total) * 100 : 0, 
        isCurrentUser: isCurrentUserRange
      };
    });
  }, [data, total, currentUserLevel]);

  const maxCount = levelDistribution.length > 0 ? Math.max(...levelDistribution.map(d => d.count)) : 0;

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  // 데이터가 없을 때
  if (!data || data.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.noData}>데이터가 없습니다</div>
      </div>
    );
  }
  return (
    <div className={styles.container}>
      {/* 차트 */}
      <div className={styles.chartArea}>
        {levelDistribution.map((segment, index) => {
          const height = maxCount > 0 ? (segment.count / maxCount) * 128 : 0;
          const isHovered = hoveredSegment === index;
          
          return (
            <div key={segment.label} className={styles.barContainer}>
              {/* 툴팁 */}
              {isHovered && (
                <div className={styles.tooltip}>
                  <div className={styles.tooltipTitle}>
                    레벨 {segment.label}
                    {segment.isCurrentUser && <span className={styles.star}>★</span>}
                  </div>
                  <div className={styles.tooltipText}>
                    전체 {total}명 중 {segment.count}명
                  </div>
                  <div className={styles.tooltipText}>
                    ({segment.percentage.toFixed(1)}%)
                  </div>
                  {segment.isCurrentUser && (
                    <div className={styles.userRange}>
                      유저 구간
                    </div>
                  )}
                  <div className={styles.tooltipArrow}></div>
                </div>
              )}
              
              {/* 바 차트 */}
              <div
                className={`${styles.bar} ${
                  segment.isCurrentUser ? styles.userBar : styles.defaultBar
                } ${isHovered ? styles.barHovered : ''}`}
                style={{ height: `${height}px` }}
                onMouseEnter={() => setHoveredSegment(index)}
                onMouseLeave={() => setHoveredSegment(null)}
              >
                {/* 사용자 수 표시 */}
                {segment.count > 0 && (
                  <div className={styles.countLabel}>
                    <span className={styles.countText}>
                      {segment.count}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 랭킹 정보 */}
      <div className={styles.rankInfo}>
        {rank !== null ? `전체 ${total}명 중 ${rank}등입니다` : '랭킹 정보 없음'}
      </div>

    </div>
  );
};

export default CompactLevelChart;