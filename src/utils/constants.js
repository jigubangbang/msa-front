// src/utils/constants.js

export const LOCAL = 'http://localhost:8080'
export const LOCAL_WS = 'ws://localhost:8080'

// API 엔드포인트
const API_ENDPOINTS = {
  // user-service
  AUTH: `${LOCAL}/api/auth`,
  USER: `${LOCAL}/api/user`,

  // admin-service (Admin 권한 필요)
  ADMIN: `${LOCAL}/api/admin`,

  // feed-service
  FEED: {
    // Public 경로 (인증 불필요)
    PUBLIC: `${LOCAL}/api/feed/public`,
    // (User 권한 필요)
    PRIVATE: `${LOCAL}/api/feed`
  },
  
  STYLE: {
    // Public 경로 (인증 불필요)
    PUBLIC: `${LOCAL}/api/style/public`,
    // (User 권한 필요)
    PRIVATE: `${LOCAL}/api/style`
  },

  // mypage-service
  MYPAGE: {
    // Public 경로 (인증 불필요)
    PUBLIC: `${LOCAL}/api/profile/public`,
    // (User 권한 필요)
    PROFILE: `${LOCAL}/api/profile`,
    USERS: `${LOCAL}/api/users`,
    COUNTRIES: `${LOCAL}/api/countries`
  },
  
  // quest-service
  QUEST: {
    // Public 경로 (인증 불필요)
    PUBLIC: `${LOCAL}/api/quests`,
    // User 권한 필요
    USER: `${LOCAL}/api/user-quests`,
    // Admin 권한 필요
    ADMIN: `${LOCAL}/api/admin-quests`
  },
  
  // 홈 서비스 (인증 불필요)
  HOME: `${LOCAL}/api/home`,
  
  // 커뮤니티 서비스
  COMMUNITY: {
    // Public 경로 (인증 불필요)
    PUBLIC: `${LOCAL}/api/com`,
    // User 권한 필요
    USER: `${LOCAL}/api/user-com`
  },
  
  // 채팅 서비스 (User 권한 필요)
  CHAT: `${LOCAL}/api/chat`,

  WS: `${LOCAL_WS}/api/ws/chat`,
  // WS: `ws://192.168.100.28:8080/api/ws/chat`,
  // WS: `http://localhost:8080/api/ws/chat`,

  NOTI: `${LOCAL}/api/notifications`,

  // 결제 서비스 (User 권한 필요)
  PAYMENT: `${LOCAL}/api/payment`,
  
  // Actuator
  ACTUATOR: {
    GATEWAY: `${LOCAL}/gateway/actuator`,
    USER_SERVICE: `${LOCAL}/user/actuator`
  }
};

export default API_ENDPOINTS;