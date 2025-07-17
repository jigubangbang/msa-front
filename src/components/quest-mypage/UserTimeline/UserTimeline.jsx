import React from 'react';
import styles from './UserTimeline.module.css';

const UserTimeline = ({ data, onQuestClick, onBadgeClick }) => {
  // 타임라인 이벤트 생성 함수
  const createTimelineEvents = () => {
    const events = [];

    // 뱃지 이벤트 추가
    data.badge.badges.forEach(badge => {
      if (badge.is_awarded && badge.awarded_at) {
        events.push({
          id: `badge_${badge.badge_id}`,
          type: 'badge',
          date: new Date(badge.awarded_at),
          title: badge.kor_title,
          subtitle: badge.eng_title,
          description: badge.description,
          icon: badge.icon,
          difficulty: badge.difficulty,
          locationId: badge.badge_id
        });
      }
    });

    // 퀘스트 완료 이벤트 추가
    data.quest.completed_quests.forEach(quest => {
      if (quest.completed_at) {
        events.push({
          id: `quest_completed_${quest.quest_id}`,
          type: 'quest_completed',
          date: new Date(quest.completed_at),
          title: quest.title,
          subtitle: `${quest.difficulty} • ${quest.xp}XP`,
          description: quest.description,
          difficulty: quest.difficulty,
          locationId: quest.quest_id
        });
      }
    });

    // 진행 중인 퀘스트 시작 이벤트 추가
    data.quest.in_progress_quests.forEach(quest => {
      if (quest.started_at) {
        events.push({
          id: `quest_started_${quest.quest_id}`,
          type: 'quest_started',
          date: new Date(quest.started_at),
          title: quest.title,
          subtitle: `${quest.difficulty} • ${quest.xp}XP`,
          description: quest.description,
          difficulty: quest.difficulty,
          locationId: quest.quest_id
        });
      }
    });

    // 날짜순으로 정렬 (최신순)
    return events.sort((a, b) => b.date - a.date);
  };

  const timelineEvents = createTimelineEvents();

  // 시간 포맷 함수
  const formatTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const timeString = date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });

    return `${year}년 \n ${month}월 ${day}일\n${timeString}`;
  };

  // 타입별 아이콘 색상
  const getIconStyle = (type) => {
    switch (type) {
      case 'badge':
        return { backgroundColor: '#f3ff49', icon: '●' };
      case 'quest_completed':
        return { backgroundColor: '#22c55e', icon: '✓' };
      case 'quest_started':
        return { backgroundColor: '#3b82f6', icon: '●' };
      default:
        return { backgroundColor: '#e5e7eb', icon: '●' };
    }
  };

  const handleQuestClick = (quest_id) => {
    onQuestClick(quest_id);
  }

  const handleBadgeClick = (badge_id) => {
    onBadgeClick(badge_id);
  }

  const TimelineItem = ({ event, isLast }) => {
    const iconStyle = getIconStyle(event.type);
    
    return (
      <div className={styles.timelineItem}>
        <div className={styles.timelineLeft}>
          <div className={styles.timeText}>
            {formatTime(event.date)}
          </div>
        </div>
        
        <div className={styles.timelineCenter}>
          <div 
            className={styles.timelineIcon}
            style={{ backgroundColor: iconStyle.backgroundColor }}
          >
            {event.type === 'badge' && event.icon ? (
              <img src={event.icon} alt={event.title} className={styles.badgeIcon} />
            ) : (
              <span className={styles.iconText}>{iconStyle.icon}</span>
            )}
          </div>
          {!isLast && <div className={styles.timelineLine}></div>}
        </div>
        
        <div className={styles.timelineRight}>
          <div className={styles.eventCard}>
            <div className={styles.eventMeta}>
              <span className={styles.eventType}>
                {event.type === 'badge' && '뱃지 획득'}
                {event.type === 'quest_completed' && '퀘스트 완료'}
                {event.type === 'quest_started' && '퀘스트 시작'}
              </span>
              {event.subtitle && (
                <span className={styles.eventSubtitle}>{event.subtitle}</span>
              )}
            </div>
            <div className={styles.eventTitleWrapper}
                onClick={() => {
                    if (event.type === 'badge') {
                    handleBadgeClick(event.locationId);
                    } else {
                    handleQuestClick(event.locationId);
                    }
              }}>
            <h3 className={styles.eventTitle}
                
            >{event.title}</h3>
            </div>
            <p className={styles.eventDescription}>
              {event.description.length > 120 
                ? `${event.description.substring(0, 120)}...` 
                : event.description
              }
            </p>
            
            
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>활동 타임라인</h2>
      </div>
      
      <div className={styles.timeline}>
        {timelineEvents.length > 0 ? (
          timelineEvents.map((event, index) => (
            <TimelineItem 
              key={event.id} 
              event={event} 
              isLast={index === timelineEvents.length - 1}
            />
          ))
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <p className={styles.emptyText}>아직 활동 기록이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTimeline;