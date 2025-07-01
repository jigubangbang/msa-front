import React, { useEffect, useState } from "react";
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import styles from "./MyQuestBadgePage.module.css";
import Sidebar from "../../../components/common/SideBar/SideBar";
import API_ENDPOINTS from "../../../utils/constants";
import { QUEST_SIDEBAR } from "../../../utils/sidebar";
import QuestModal from "../../../components/modal/QuestModal/QuestModal";


export default function MyQuestBadgePage() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [userQuests, setUserQuests] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState(null);

  // 샘플 퀘스트 데이터들
  const questData1 = {
    "id": 12,
    "type": "CHECK",
    "category": 7,
    "title": "커뮤니티 활동가",
    "description": "\\uD83D\\uDDD3 단지 여행뿐만 아니라 여행 커뮤니티에도 발을 들이세요. 여행은 혼자만의 경험이 아닙니다. 3일 연속으로 커뮤니티 게시판에 게시글을 작성하면 완료되는 이 퀘스트는 다른 여행자들과의 소통과 정보 공유를 통해 더 풍성한 여행 문화를 만들어가는 역할을 인정받는 도전입니다. 개인의 여행을 넘어 공동체의 여행 경험을 풍부하게 만드는 기여자가 되어보세요. ✅ 퀘스트 조건: 연속 3일간 커뮤니티 게시글 업로드",
    "difficulty": "EASY",
    "xp": 100,
    "is_seasonal": false,
    "season_start": null,
    "season_end": null,
    "status": "ACTIVE",
    "user_id": "aaa",
    "nickname": "여행러버",
    "quest_status": "IN_PROGRESS",
    "quest_user_id": "377",
    "started_at": "2024-11-12 23:15:00",
    "completed_at": null,
    "given_up_at": null,
    "badge_id": "5",
    "badge_icon": "https://msa-s3-bucket-333.s3.ap-northeast-2.amazonaws.com/badges/b5.png",
    "kor_title": "데일리 트래블러",
    "eng_title": "Daily Traveler",
    "count_in_progress": 4,
    "in_progress_user": [
      {"user_id": "bbb", "nickname": "백패커지영", "profile_image": null},
      {"user_id": "ccc", "nickname": "포토트래블러", "profile_image": null},
      {"user_id": "ddd", "nickname": "미식탐험가", "profile_image": null},
      {"user_id": "aaa", "nickname": "여행러버", "profile_image": null}
    ],
    "count_completed": 5,
    "completed_user": [
      {"user_id": "ggg", "nickname": "산악인", "profile_image": null},
      {"user_id": "hhh", "nickname": "섬마니아", "profile_image": null},
      {"user_id": "iii", "nickname": "도시탐험가", "profile_image": null},
      {"user_id": "eee", "nickname": "자유여행꾼", "profile_image": null},
      {"user_id": "fff", "nickname": "힐링트래블", "profile_image": null}
    ]
  };

  const questData2 = {
    "id": 15,
    "type": "AUTH",
    "category": 5,
    "title": "자연 탐험가",
    "description": "🌲 자연의 아름다움을 발견하고 기록하세요. 국립공원이나 자연보호구역을 방문하여 생태계의 다양성을 체험하는 퀘스트입니다. ✅ 퀘스트 조건: 자연 보호구역 방문 인증 사진 업로드",
    "difficulty": "MEDIUM",
    "xp": 200,
    "is_seasonal": true,
    "season_start": "2025-03-01 00:00:00",
    "season_end": "2025-05-31 23:59:59",
    "status": "ACTIVE",
    "user_id": "nature_lover",
    "nickname": "자연사랑",
    "quest_status": "COMPLETED",
    "quest_user_id": "445",
    "started_at": "2025-03-15 10:30:00",
    "completed_at": "2025-04-02 16:45:00",
    "given_up_at": null,
    "badge_id": "12",
    "badge_icon": "https://msa-s3-bucket-333.s3.ap-northeast-2.amazonaws.com/badges/b12.png",
    "kor_title": "자연 수호자",
    "eng_title": "Nature Guardian",
    "count_in_progress": 8,
    "in_progress_user": [
      {"user_id": "hiker1", "nickname": "등산러버", "profile_image": null},
      {"user_id": "hiker2", "nickname": "트레킹맨", "profile_image": null},
      {"user_id": "hiker3", "nickname": "숲속여행자", "profile_image": null}
    ],
    "count_completed": 12,
    "completed_user": [
      {"user_id": "nature1", "nickname": "자연탐험가", "profile_image": null},
      {"user_id": "nature2", "nickname": "생태학자", "profile_image": null},
      {"user_id": "nature3", "nickname": "환경지킴이", "profile_image": null}
    ]
  };

  const questData3 = {
    "id": 20,
    "type": "CHECK",
    "category": 3,
    "title": "미식 여행가",
    "description": "🍜 지역의 대표 음식을 맛보고 기록하는 퀘스트입니다. 각 지역만의 특색있는 음식 문화를 체험해보세요. ✅ 퀘스트 조건: 5개 지역의 대표 음식 인증",
    "difficulty": "HARD",
    "xp": 300,
    "is_seasonal": false,
    "season_start": null,
    "season_end": null,
    "status": "ACTIVE",
    "user_id": "foodie",
    "nickname": "맛집헌터",
    "quest_status": null, // 아직 도전하지 않음
    "quest_user_id": null,
    "started_at": null,
    "completed_at": null,
    "given_up_at": null,
    "badge_id": "8",
    "badge_icon": "https://msa-s3-bucket-333.s3.ap-northeast-2.amazonaws.com/badges/b8.png",
    "kor_title": "미식 마스터",
    "eng_title": "Gourmet Master",
    "count_in_progress": 15,
    "in_progress_user": [
      {"user_id": "food1", "nickname": "미식가", "profile_image": null},
      {"user_id": "food2", "nickname": "요리연구가", "profile_image": null},
      {"user_id": "food3", "nickname": "맛집탐험가", "profile_image": null}
    ],
    "count_completed": 7,
    "completed_user": [
      {"user_id": "chef1", "nickname": "셰프박", "profile_image": null},
      {"user_id": "chef2", "nickname": "요리왕", "profile_image": null}
    ]
  };

  const openModal = (questData) => {
    setSelectedQuest(questData);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedQuest(null);
  };

  //SideBar//
    const location = useLocation();
    const currentPath = location.pathname;
      const getActiveMenuItems = () => {
      return QUEST_SIDEBAR.map(item => {
        let isActive = false;
        
        if (item.submenu) {
          isActive = item.path === currentPath;
        } else {
          isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
        }
        return {
          ...item,
          active: isActive
        };
      });
    };
  
    const finalMenuItems = getActiveMenuItems(QUEST_SIDEBAR);
    //SideBar//


  useEffect(()=>{
    fetchUser();
  }, []);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_ENDPOINTS.QUEST.USER}/journey`);
      setUser(response.data);
      console.log("User data fetched:", response.data);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };


 if (loading) {
    return (
      <div className={styles.Container}>
        <Sidebar menuItems={finalMenuItems} />
        <div className={styles.content}>
          <div className={styles.loading}>로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.Container}>
      <Sidebar menuItems={finalMenuItems} />

      <div className={styles.content}>
        <div className={styles.contentWrapper}>
          <h2>My Quest Page</h2>

              <div style={{ 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px', color: '#333' }}>
        퀘스트 모달 예시
      </h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* 진행 중인 퀘스트 */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>진행 중인 퀘스트</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>커뮤니티 활동가 (초급)</p>
          <button 
            onClick={() => openModal(questData1)}
            style={{
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            퀘스트 상세보기
          </button>
        </div>

        {/* 완료된 퀘스트 */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>완료된 퀘스트</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>자연 탐험가 (중급)</p>
          <button 
            onClick={() => openModal(questData2)}
            style={{
              background: '#2196F3',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            퀘스트 상세보기
          </button>
        </div>

        {/* 새로운 퀘스트 */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>새로운 퀘스트</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>미식 여행가 (고급)</p>
          <button 
            onClick={() => openModal(questData3)}
            style={{
              background: '#FF9800',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            퀘스트 상세보기
          </button>
        </div>
      </div>

      {/* 사용법 설명 */}
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginTop: '40px',
        maxWidth: '800px',
        margin: '40px auto 0'
      }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>🚀 사용법</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#555', fontSize: '18px', marginBottom: '10px' }}>1. 컴포넌트 import</h3>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '8px', 
            fontSize: '14px',
            overflow: 'auto'
          }}>
{`import QuestModal from './components/QuestModal';`}
          </pre>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#555', fontSize: '18px', marginBottom: '10px' }}>2. 상태 관리</h3>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '8px', 
            fontSize: '14px',
            overflow: 'auto'
          }}>
{`const [showModal, setShowModal] = useState(false);
const [selectedQuest, setSelectedQuest] = useState(null);`}
          </pre>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#555', fontSize: '18px', marginBottom: '10px' }}>3. 모달 사용</h3>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '8px', 
            fontSize: '14px',
            overflow: 'auto'
          }}>
{`{showModal && (
  <QuestModal 
    questData={selectedQuest} 
    onClose={() => setShowModal(false)} 
  />
)}`}
          </pre>
        </div>

        <div>
          <h3 style={{ color: '#555', fontSize: '18px', marginBottom: '10px' }}>4. 주요 기능</h3>
          <ul style={{ color: '#666', lineHeight: '1.6' }}>
            <li>✅ 퀘스트 상태별 다른 UI (도전하기/진행중/완료/포기)</li>
            <li>🎭 배지 호버 효과 및 툴팁</li>
            <li>👥 참여자 아바타 표시 (최대 3명 + 나머지 인원수)</li>
            <li>📱 반응형 디자인 (모바일 지원)</li>
            <li>🎨 이모지 유니코드 자동 변환</li>
            <li>📊 완수율 자동 계산</li>
            <li>🗓️ 시즌 퀘스트 날짜 표시</li>
          </ul>
        </div>
      </div>

      {/* 퀘스트 모달 */}
      {showModal && (
        <QuestModal 
          questData={selectedQuest} 
          onClose={closeModal}
          isLogin={true} 
        />
      )}
    </div>

        </div>
      </div>
    </div>
  );

}