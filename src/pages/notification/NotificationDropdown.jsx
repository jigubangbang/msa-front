import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NotificationDropdown.module.css';
import API_ENDPOINTS from '../../utils/constants';
import { Circles } from 'react-loader-spinner';
import { formatRelativeTime } from '../../utils/formatRelativeTime';
import bell from '../../assets/chat/notification_bell_26.svg';

const NotificationDropdown = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 읽지 않은 알림 개수 조회
  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.NOTI}/unread-count`, {
        headers: {
          'User-Id': userId,
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      if (response.ok) {
        const count = await response.json();
        setUnreadCount(count);
      }
    } catch (error) {
      console.error('읽지 않은 알림 개수 조회 실패:', error);
      // 개발용 더미 데이터
      setUnreadCount(3);
    }
  };

  // 알림 목록 조회
  const fetchNotifications = async (page = 0, append = false) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.NOTI}/all?page=${page}&size=5`, {
        headers: {
          'User-Id': userId,
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (append) {
          setNotifications(prev => [...prev, ...data]);
        } else {
          setNotifications(data);
        }
        setHasMore(data.length === 5);
        setCurrentPage(page);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('알림 조회 실패:', error);
      setHasMore(false);
    }
    setLoading(false);
  };

  // 알림 읽음 처리
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.NOTI}/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'User-Id': userId,
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('읽음 처리 실패:', error);
      // 로컬 상태만 업데이트
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    if (notification.relatedUrl) {
      navigate(notification.relatedUrl);
      setIsOpen(false);
    }
  };


  // 모든 알림 읽음 처리
  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.NOTI}/read-all`, {
        method: 'POST',
        headers: {
          'User-Id': userId,
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('전체 읽음 처리 실패:', error);
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    }
  };

  // 알림 삭제
  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.NOTI}/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'User-Id': userId,
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const deletedNotif = notifications.find(n => n.id === notificationId);
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        if (deletedNotif && !deletedNotif.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('삭제 실패:', error);
      const deletedNotif = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
  };

  // 드롭다운 토글
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications(0);
    }
  };

  // 더 보기
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(currentPage + 1, true);
    }
  };

  // 알림 타입별 아이콘
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'CHAT_MESSAGE':
        return '💬';
      case 'FRIEND_REQUEST':
        return '👥';
      case 'SYSTEM':
        return '⚙️';
      default:
        return '📢';
    }
  };

  // 컴포넌트 마운트 시 읽지 않은 알림 개수 조회
  useEffect(() => {
    if (userId) {
      fetchUnreadCount();
      // 30초마다 읽지 않은 알림 개수 갱신
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  return (
    <div className={styles.notificationContainer} ref={dropdownRef}>
      {/* 알림 아이콘 */}
      <button className={styles.notificationButton} onClick={toggleDropdown}>
        <img src={bell}/>
        {unreadCount > 0 && (
          <span className={styles.badge}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* 드롭다운 */}
      {isOpen && (
        <div className={styles.dropdown}>
          {/* 헤더 */}
          <div className={styles.dropdownHeader}>
            <h3>알림</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className={styles.markAllButton}>
                모두 읽음
              </button>
            )}
          </div>

          {/* 알림 목록 */}
          <div className={styles.notificationList}>
            {loading && notifications.length === 0 ? (
              <div className={styles.loading}>로딩 중...</div>
            ) : notifications.length === 0 ? (
              <div className={styles.empty}>알림이 없습니다</div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`${styles.notificationItem} ${
                      !notification.isRead ? styles.unread : ''
                    }`}
                  >
                    <div className={styles.notificationContent}>
                      <div className={styles.notificationHeader}>
                        <span className={styles.icon}>
                          {getNotificationIcon(notification.type)}
                        </span>
                        <span className={styles.time}>
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                        {!notification.isRead && (
                          <span className={styles.unreadDot}></span>
                        )}
                      </div>
                      <p 
                        className={styles.message}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        {notification.message}
                      </p>
                    </div>
                    <button
                      className={styles.deleteButton}
                      onClick={() => deleteNotification(notification.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                {hasMore && (
                  <button 
                    className={styles.loadMoreButton}
                    onClick={loadMore}
                    disabled={loading}
                  >
                    {loading ? <Circles /> : '더 보기'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;