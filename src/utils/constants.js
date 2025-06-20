// src/utils/constants.js

// API 엔드포인트
export const API_ENDPOINTS = {
  // user-service
  AUTH: '/api/auth',
  USER: '/api/user',

  // admin-service (Admin 권한 필요)
  ADMIN: '/api/admin',

  // feed-service
  FEED: {
    // Public 경로 (인증 불필요)
    PUBLIC: '/api/feed/public',
    // (User 권한 필요)
    PRIVATE: '/api/feed'
  },
  
  STYLE: {
    // Public 경로 (인증 불필요)
    PUBLIC: '/api/style/public',
    // (User 권한 필요)
    PRIVATE: '/api/style'
  },

  // mypage-service
  MYPAGE: {
    // Public 경로 (인증 불필요)
    PUBLIC: '/api/public',
    // (User 권한 필요)
    PROFILE: '/api/profile',
    USERS: '/api/users',
    COUNTRIES: '/api/countries'
  },
  
  // quest-service
  QUEST: {
    // Public 경로 (인증 불필요)
    PUBLIC: '/api/quests',
    // User 권한 필요
    USER: '/api/user-quests',
    // Admin 권한 필요
    ADMIN: '/api/admin-quests'
  },
  
  // 홈 서비스 (인증 불필요)
  HOME: '/api/home',
  
  // 커뮤니티 서비스
  COMMUNITY: {
    // Public 경로 (인증 불필요)
    PUBLIC: '/api/com',
    // User 권한 필요
    USER: '/api/user-com'
  },
  
  // 채팅 서비스 (User 권한 필요)
  CHAT: '/api/chat',
  
  // 결제 서비스 (User 권한 필요)
  PAYMENT: '/api/payment',
  
  // Actuator
  ACTUATOR: {
    GATEWAY: '/gateway/actuator',
    USER_SERVICE: '/user/actuator'
  }
};
