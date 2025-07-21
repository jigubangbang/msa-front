# 🌍 MSA-Front

**Jigubangbang 여행 소셜 플랫폼 프론트엔드 애플리케이션**

이 애플리케이션은 Jigubangbang MSA 아키텍처의 **사용자 인터페이스**를 담당하며, 여행을 좋아하는 사람들을 위한 **종합 소셜 플랫폼**을 제공합니다.

## 📋 프로젝트 개요

### 🎯 주요 역할
- **통합 UI**: 13개 마이크로서비스의 기능을 하나의 사용자 경험으로 통합
- **여행 소셜 플랫폼**: 여행 계획부터 경험 공유까지 전 과정 지원
- **반응형 웹앱**: 모바일/데스크톱 대응 현대적 사용자 인터페이스

### 🏗️ 아키텍처 위치
```
Users ←→ MSA-Front (React) ←→ API Gateway ←→ [13 Microservices]
                                    ↕
                            [User, Feed, Quest, Chat, Payment, Admin...]
```

## 🚀 주요 기능

### 1. 여행 전용 서비스
- **여행메이트 매칭**: 여행 동반자 찾기 및 매칭 시스템
- **여행정보 공유**: 여행 팁, 후기, 정보 게시판
- **여행 스타일 테스트**: 개인 여행 성향 분석 및 추천
- **여행 기록**: 방문 국가 지도 시각화, 여행 일기

### 2. 소셜 네트워킹
- **피드 시스템**: 게시물 작성/조회, 좋아요, 댓글, 북마크
- **팔로우 시스템**: 사용자 간 팔로잉/팔로워 관계 관리
- **사용자 추천**: 알고리즘 기반 사용자 추천 및 검색
- **커뮤니티 게시판**: 지역별, 주제별 게시판

### 3. 게이미피케이션
- **퀘스트 시스템**: 미션 완료를 통한 포인트 획득
- **배지 컬렉션**: 성취 기반 배지 수집 및 전시
- **랭킹 시스템**: 사용자 활동 기반 순위 시스템
- **레벨 업**: 활동 점수에 따른 등급 시스템

### 4. 사용자 관리 & 프로필
- **계정 관리**: 회원가입, 로그인, 프로필 설정
- **개인화**: 여행 성향, 언어 설정, 알림 설정
- **버킷리스트**: 가고 싶은 여행지 관리 시스템
- **활동 내역**: 게시물, 댓글, 좋아요 기록

### 5. 실시간 커뮤니케이션
- **실시간 채팅**: 1:1 및 그룹 채팅
- **실시간 알림**: 즉시 푸시 알림 시스템
- **온라인 상태**: 사용자 접속 상태 표시

### 6. 관리 & 결제 시스템
- **관리자 도구**: 사용자/게시물/신고 관리 대시보드
- **결제 서비스**: 프리미엄 멤버십 구독 관리
- **고객 지원**: 문의 및 신고 처리 시스템

## 🛠️ 기술 스택

**Core Framework**
- React 18.3.1 + Vite 6.3.5 (빠른 개발 환경)
- JavaScript ES6+ (모던 문법)

**상태 관리 & 라우팅**
- Zustand 5.0.6 (경량 상태 관리)
- React Router DOM 7.6.3 (클라이언트 사이드 라우팅)

**통신 & 연동**
- Axios 1.10.0 (HTTP 클라이언트)
- STOMP.js + SockJS (WebSocket 실시간 통신)
- JWT Decode (인증 토큰 처리)

**UI & 스타일링**
- Material-UI 7.2.0 (컴포넌트 라이브러리)
- Bootstrap Icons (아이콘 세트)
- CSS Modules (컴포넌트별 스타일 격리)

**데이터 시각화 & 지도**
- React Simple Maps (지도 렌더링)
- D3 Geo (지리 데이터 처리)
- Day.js (날짜 처리)

## 🌐 주요 라우트

### 공개 페이지 (인증 불필요)
```bash
/                          # 메인 랜딩 페이지
/login                     # 로그인
/register                  # 회원가입
/find-password             # 비밀번호 찾기

# 공개 API 경로
/api/auth/**               # 인증 관련 (로그인/회원가입)
/api/feed/public/**        # 공개 피드 조회
/api/style/public/**       # 여행 스타일 테스트 (비회원)
/api/profile/public/**     # 공개 프로필 조회
/api/quests/**             # 퀘스트 목록 조회
/api/com/**                # 커뮤니티 게시판 조회
/api/home/**               # 홈 화면 정보
```

### 관리자 페이지 (ADMIN 권한)
```bash
/admin                     # 관리자 대시보드
/admin/users               # 사용자 관리
/admin/posts               # 게시물 관리
/admin/reports             # 신고 관리
/admin/quests              # 퀘스트 관리
```

### 그 외 인증 필요 (USER 권한)

## 🚀 실행 방법

### 사전 요구사항
1. **Node.js 18+** 설치
2. **Backend Services** 실행 상태 확인
3. **환경 변수** 설정

### 로컬 개발 환경
```bash
# 1. 프로젝트 클론
git clone https://github.com/jigubangbang/msa-front.git
cd msa-front

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정 (.env 파일 생성)
VITE_API_BASE_URL=http://localhost:8080
VITE_JWT_SECRET_KEY=your-secret-key

# 4. 개발 서버 실행
npm run dev

# 5. 브라우저에서 확인
# http://localhost:5173
```

### 프로덕션 빌드
```bash
# 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# 정적 파일 배포 (dist/ 폴더)
# Nginx, Apache, Vercel, Netlify 등에 배포 가능
```

## 💡 주요 구현 사항

### 1. 체계적인 API 엔드포인트 관리
**문제**: 13개 마이크로서비스의 복잡한 API 경로 관리  
**해결**: 중앙집중식 API 엔드포인트 상수 관리

```javascript
// src/utils/constants.js
export const LOCAL = 'http://localhost:8080';

const API_ENDPOINTS = {
  // 인증 서비스
  AUTH: `${LOCAL}/api/auth`,
  USER: `${LOCAL}/api/user`,
  
  // 피드 서비스 (Public/Private 분리)
  FEED: {
    PUBLIC: `${LOCAL}/api/feed/public`,    // 비회원 접근 가능
    PRIVATE: `${LOCAL}/api/feed`           // 회원 전용
  },
  
  // 퀘스트 서비스 (권한별 분리)
  QUEST: {
    PUBLIC: `${LOCAL}/api/quests`,         // 퀘스트 목록 조회
    USER: `${LOCAL}/api/user-quests`,      // 사용자 퀘스트
    ADMIN: `${LOCAL}/api/admin-quests`     // 관리자 퀘스트 관리
  },
  
  // WebSocket 연결
  WS: `ws://localhost:8080/api/ws/chat`,
};
```

### 2. 컴포넌트 최적화
**문제**: 대규모 애플리케이션에서 렌더링 성능  
**해결**: React.memo, useMemo, useCallback 적극 활용

```javascript
// components/feed/FeedItem.jsx
export const FeedItem = memo(({ post, onLike, onComment }) => {
  const handleLike = useCallback(() => {
    onLike(post.id);
  }, [post.id, onLike]);
  
  const formattedDate = useMemo(() => {
    return formatDate(post.createdAt);
  }, [post.createdAt]);
  
  return (
    <div className={styles.feedItem}>
      {/* 피드 아이템 렌더링 */}
    </div>
  );
});
```

### 3. 실시간 WebSocket 연동
**문제**: MSA 환경에서 실시간 채팅 및 알림 구현  
**해결**: STOMP 프로토콜과 커스텀 훅 활용

```javascript
// hooks/useWebSocket.js
export const useWebSocket = () => {
  const [client, setClient] = useState(null);
  
  const connect = useCallback(() => {
    const token = getToken();
    const socket = new SockJS(API_ENDPOINTS.WS);
    const stompClient = Stomp.over(socket);
    
    stompClient.connect(
      { Authorization: `Bearer ${token}` },
      (frame) => {
        setClient(stompClient);
      }
    );
  }, []);
  
  return { client, connect };
};
```

## 🔧 설정 정보

### 개발 서버
- **포트**: 5173 (Vite 기본)
- **HMR**: Hot Module Replacement 지원
- **API Gateway 연동**: http://localhost:8080

### API 엔드포인트 구성
```javascript
// src/utils/constants.js
export const LOCAL = 'http://localhost:8080';  // API Gateway 주소
```

### JWT 토큰 관리
```javascript
// 자동 토큰 첨부 (Public API 제외)
- /api/auth/** ← 토큰 불필요
- /api/feed/public/** ← 토큰 불필요  
- /api/quests/** ← 토큰 불필요
- /api/com/** ← 토큰 불필요
- 그 외 모든 API ← Bearer 토큰 자동 첨부

// 토큰 만료 시 자동 갱신
Access Token 만료 (401) → Refresh Token으로 갱신 → 요청 재시도
Refresh Token 만료 → 자동 로그아웃 → 로그인 페이지 이동
```

### 환경별 설정
```bash
# 개발 환경
VITE_API_BASE_URL=http://localhost:8080       # API Gateway
VITE_WS_BASE_URL=ws://localhost:8080          # WebSocket Gateway

# 배포 환경 (예시)
VITE_API_BASE_URL=https://api.jigubangbang.com
VITE_WS_BASE_URL=wss://api.jigubangbang.com
```

### 빌드 설정
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',  // 외부 접속 허용
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@mui/material', '@mui/icons-material'],
          utils: ['axios', 'zustand', 'dayjs']
        }
      }
    }
  },
  define: {
    // 환경 변수를 빌드 시점에 주입
    __API_URL__: JSON.stringify(process.env.VITE_API_BASE_URL || 'http://localhost:8080')
  }
});
```

## 🚨 트러블슈팅

### JWT 토큰 관련 문제
```bash
# 증상: API 요청 시 401 Unauthorized
# 원인: Access Token 만료 또는 Refresh Token 만료
# 해결: 자동 토큰 갱신 시스템이 작동하는지 확인

# 토큰 상태 확인
localStorage.getItem('accessToken')
localStorage.getItem('refreshToken')

# 세션 만료 확인
localStorage.getItem('sessionExpired')  // "true"면 자동 로그아웃됨

# 수동 해결
localStorage.clear()  // 모든 토큰 제거 후 재로그인

### 자동 로그아웃 발생
```bash
# 증상: 예기치 않은 로그아웃
# 원인: Refresh Token 만료 또는 서버 오류
# 해결:

# forceLogout 이벤트 확인
window.addEventListener('forceLogout', () => {
  console.log('자동 로그아웃 발생');
});

# 서버 로그 확인 필요
curl http://localhost:8080/gateway/actuator/metrics
```

## 🔮 향후 개선사항

**사용자 경험 향상**
- **다크 모드**: 사용자 선호도 기반 테마 시스템
- **모바일 최적화**: 웹사이트를 넘어 사용자 휴대기기에서도 사용 가능
- **무한 스크롤**: 피드 및 리스트 성능 최적화
- **이미지 지연 로딩**: 대용량 이미지 최적화
- **프리미엄 기능 확장**

**모니터링 & 분석**
- **Sentry 통합**: 실시간 에러 모니터링
- **Performance Monitoring**: Core Web Vitals 측정
- **Bundle Analyzer**: 빌드 최적화 자동화

## 👥 기여자

**Frontend Team** - 전체 팀원 공동 개발
- 👨‍💼 **이설영**: 전체 아키텍처 설계, 실시간 채팅 UI, WebSocket 및 알림 서비스 연동
- 👩‍💻 **박나혜**: 사용자 인증 시스템, 관리자 대시보드, 권한 관리
- 👨‍💻 **남승현**: 소셜 피드 시스템, 마이페이지, 사용자 프로필
- 👩‍💻 **권민정**: 퀘스트/배지 시스템, 커뮤니티 게시판, 여행메이트 매칭
- 👨‍💻 **장준환**: 결제 시스템 연동, 빌드/배포 자동화, 성능 최적화

## 🔗 관련 리포지토리

- **전체 프로젝트**: [Jigubangbang Organization](https://github.com/jigubangbang)
- **백엔드 인프라**: [infra-platform](https://github.com/jigubangbang/infra-platform)
- **사용자/관리자/결제 서비스**: [user-admin-repo](https://github.com/jigubangbang/user-admin-repo)
- **피드/마이페이지 서비스**: [Organization Repositories](https://github.com/orgs/jigubangbang/feed-mypage-repo)
- **퀘스트/커뮤니티 서비스**: [Organization Repositories](https://github.com/orgs/jigubangbang/qc-home-repo)
- **채팅/알림 서비스**: [chat-service](https://github.com/jigubangbang/chat-service)

---

**💡 Quick Start**
```bash
# 백엔드 인프라가 실행된 상태에서
git clone https://github.com/jigubangbang/msa-front.git
cd msa-front && npm install

# 환경 변수 설정
echo "VITE_API_BASE_URL=http://localhost:8080" > .env

# 개발 서버 실행
npm run dev

# 브라우저에서 확인
open http://localhost:5173

# API Gateway 연결 테스트
curl http://localhost:8080/api/auth/health
```

여행의 모든 순간을 함께 나누는 Jigubangbang과 함께 세계를 탐험해보세요! 🌍✈️
