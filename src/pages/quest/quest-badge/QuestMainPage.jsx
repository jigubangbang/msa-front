import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import API_ENDPOINTS from "../../../utils/constants";
import {QUEST_SIDEBAR} from "../../../utils/sidebar";

import {jwtDecode} from "jwt-decode";

import styles from "./QuestMainPage.module.css";
import Sidebar from "../../../components/common/SideBar/SideBar";
import ProfileCard from "../../../components/quest/ProfileCard/ProfileCard";
import QuestCarousel from "../../../components/quest/QuestCarousel/QuestCarousel";
import RankCard from "../../../components/quest/RankCard/RankCard";
import BadgeCard from "../../../components/quest/BadgeCard/BadgeCard";
import QuestSlider from "../../../components/quest/QuestSlider/QuestSlider";
import QuestList from "../../../components/quest/QuestList/QuestList";
import QuestModal from "../../../components/modal/QuestModal/QuestModal";

function Rankings() {
  const [rankingData, setRankingData] = useState({
    weeklyQuest: null,
    weeklyLevel: null,
    topLevel: null,
    topQuest: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRankingData = async () => {
      try {
        setLoading(true);
        
        // 4개 API 동시 호출
        const [weeklyQuestRes, weeklyLevelRes, topLevelRes, topQuestRes] = await Promise.all([
          fetch(`${API_ENDPOINTS.QUEST.PUBLIC}/weekly-quest`),
          fetch(`${API_ENDPOINTS.QUEST.PUBLIC}/weekly-level`),
          fetch(`${API_ENDPOINTS.QUEST.PUBLIC}/top-level`),
          fetch(`${API_ENDPOINTS.QUEST.PUBLIC}/top-quest`)
        ]);

        // 응답 확인
        if (!weeklyQuestRes.ok || !weeklyLevelRes.ok || !topLevelRes.ok || !topQuestRes.ok) {
          throw new Error('API 요청 실패');
        }

        // JSON 파싱
        const [weeklyQuest, weeklyLevel, topLevel, topQuest] = await Promise.all([
          weeklyQuestRes.json(),
          weeklyLevelRes.json(),
          topLevelRes.json(),
          topQuestRes.json()
        ]);

        setRankingData({
          weeklyQuest,
          weeklyLevel,
          topLevel,
          topQuest
        });
      } catch (err) {
        console.error('랭킹 데이터 가져오기 실패:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRankingData();
  }, []);

  const transformToCardData = (data, title, countKey) => {
    if (!data) return null;
    
    return {
      id: data.user_id,
      title: title,
      count: data[countKey],
      profile_image: data.profile_image,
      level: data.level,
      nickname: data.nickname
    };
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.cardGrid}>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.cardGrid}>
          <p>데이터를 불러오는데 실패했습니다: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.cardGrid}>
        {rankingData.weeklyQuest && (
          <ProfileCard 
            {...transformToCardData(
              rankingData.weeklyQuest, 
              "이번 주 퀘스트 왕", 
              "weekly_quest_count"
            )} 
          />
        )}
        
        {rankingData.weeklyLevel && (
          <ProfileCard 
            {...transformToCardData(
              rankingData.weeklyLevel, 
              "이번 주 레벨업 왕", 
              "weekly_level_gain"
            )} 
          />
        )}
        
        {rankingData.topLevel && (
          <ProfileCard 
            {...transformToCardData(
              rankingData.topLevel, 
              "최고 레벨 달성자", 
              "level"
            )} 
          />
        )}
        
        {rankingData.topQuest && (
          <ProfileCard 
            {...transformToCardData(
              rankingData.topQuest, 
              "총 퀘스트 완료 왕", 
              "total_quest_count"
            )} 
          />
        )}
      </div>
    </div>
  );
}


export default function QuestMainPage() {
  const [loading, setLoading] = useState(false);
  const [userinfo, setUserinfo] = useState(null);
  const [userQuest, setUserQuest] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [userBadge, setUserBadge] = useState(null);

  const [seasonalQuest, setSeasonalQuest] = useState(null);

  const [isLogin, setIsLogin] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState(null);

  const navigate = useNavigate();


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
    const token = localStorage.getItem("accessToken");
    //#NeedToChange 토큰에서 잘 뽑아왔다고 가정
    // setIsLogin(true);
    // fetchUserinfo();
    // fetchUserQuest();
    // fetchUserBadge();
    // fetchUserRank();

    if (token) {
      setIsLogin(true);
      //decoded
      const decoded = jwtDecode(token);
      fetchUserinfo();
      fetchUserQuest();
      fetchUserBadge();
      fetchUserRank();
    }

    fetchSeasonalQuest();
  }, []);

  const fetchUserinfo = async () => {
    setLoading(true);
    try{
      const response = await axios.get(`${API_ENDPOINTS.QUEST.USER}/journey`)
      setUserinfo(response.data || {});
    }catch(err){
      console.error("Failed to fetch user info", err);
    }finally{
      setLoading(false);
    }
  }

  const fetchUserRank = async () => {
    setLoading(true);
    try{
      const response = await axios.get(`${API_ENDPOINTS.QUEST.USER}/ranking/my`)
      setUserRank(response.data || {});
    }catch(err){
      console.error("Failed to fetch user rank", err);
    }finally{
      setLoading(false);
    }
  }

  const fetchUserQuest = async () => {
    setLoading(true);
    try{
      const response = await axios.get(`${API_ENDPOINTS.QUEST.USER}/detail`, {
      params: {
        status: "IN_PROGRESS"
      }
    });
      setUserQuest(response.data || {});
    }catch(err){
      console.error("Failed to fetch user info", err);
      setUserQuest(null);
    }finally{
      setLoading(false);
    }
  }

  const fetchUserBadge = async () => {
    setLoading(true);
    try{
      const response = await axios.get(`${API_ENDPOINTS.QUEST.USER}/badges/my`);
      setUserBadge(response.data || {});
    }catch(err){
      console.error("Failed to fetch user badge", err);
      setUserBadge({ badges: [], totalCount: 0 });
    }finally{
      setLoading(false);
    }
  }

  const fetchSeasonalQuest = async () => {
    setLoading(true);
    try{
      const response = await axios.get(`${API_ENDPOINTS.QUEST.PUBLIC}/list`, {
        params: {
          category: 10
        }
      });
      setSeasonalQuest(response.data.quests || {});
    }catch(err){
      console.error("Failed to fetch seasonal quest", err);
      setSeasonalQuest(null);
    }finally{
      setLoading(false);
    }
  }

  const openQuestModal = async (quest_id) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_ENDPOINTS.QUEST.USER}/detail/${quest_id}`);
      setSelectedQuest(response.data);
      setShowModal(true);
      console.log("Quest data fetched:", response.data);
    } catch (error) {
      console.error("Failed to fetch quest data:", error);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedQuest(null);
  };


  return (
    <div className={styles.Container}>
      <Sidebar menuItems={finalMenuItems} />
      <div className={styles.content}>
        <Rankings/>
        

          <div className={styles.loginContent}>
          {isLogin ? (
              <>
                {userQuest && (
                  <QuestCarousel 
                    quests={userQuest} 
                    title="Ongoing Quests" 
                    onOpenModal={openQuestModal}
                  />
                )}
              </>
            ) : (
              <QuestCarousel 
                quests={null} 
                title="Ongoing Quests" 
                onOpenModal={openQuestModal}
                isLogin={false}
              />
            )}

          <div className={styles.verticalDivider}></div>
          
          <div className={styles.loginRightContent}>
            <h2 className={styles.rightTitle}>My Quest Journey</h2>

            <div className={styles.card}>
            <ProfileCard 
                id={isLogin && userinfo ? userinfo.user_id : null}
                title={"Total Quests Completed"} 
                count={isLogin && userinfo ? userinfo.completed_quest_count : 0} 
                profile_image={isLogin && userinfo ? userinfo.profile_image : null}
                level={isLogin && userinfo ? userinfo.level : 0}
                nickname={isLogin && userinfo ? userinfo.nickname : "Guest"}
                isLogin={isLogin}
              />
            </div>
          
            <div className={styles.card}>
              <RankCard 
                title={"My Rank"} 
                count={isLogin && userRank ? userRank.count : null}
                totalCount={isLogin && userRank ? userRank.totalCount : null}
                isLogin={isLogin}
              />
            </div>

            <div className={styles.card}>
              <BadgeCard 
                userBadge={isLogin ? userBadge : { badges: [], totalCount: 0 }}
                isLogin={isLogin}
              />
            </div>
          </div>
        </div>

        

        <div className={styles.questContent}>
        {seasonalQuest && (
            <div className={styles.seasonalQuestContainer}>
                <QuestSlider quests={seasonalQuest} title="Seasonal Events"/>
            </div>
          )}
            
          </div>
        <QuestList/>
      </div>

      {/* 퀘스트 모달 */}
      {showModal && (
        <QuestModal 
          questData={selectedQuest} 
          onClose={closeModal} 
        />
      )}
    </div>
  );
}