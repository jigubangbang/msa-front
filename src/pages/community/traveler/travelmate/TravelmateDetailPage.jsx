import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { TRAVELER_SIDEBAR } from "../../../../utils/sidebar";
import styles from './TravelmateDetailPage.module.css';
import Sidebar from "../../../../components/common/SideBar/SideBar";
import TravelmateDetailMain from '../../../../components/travelmateForm/TravelmateDetailMain/TravelmateDetailMain';
import TravelmateMembers from '../../../../components/travelmateForm/TravelmateMembers/TravelmateMembers';
import TravelmateQA from '../../../../components/travelmateForm/TravelmateQA/TravelmateQA';


const TravelmateDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  //SideBar//
  const currentPath = location.pathname;
  const getActiveMenuItems = () => {
    return TRAVELER_SIDEBAR.map(item => {
      let isActive = false;

      if (item.submenu) {
        isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
      } else {
        isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
      }

      return {
        ...item,
        active: isActive
      };
    });
  };
  const finalMenuItems = getActiveMenuItems();
  //SideBar//

  useEffect(() => {
    // 로그인 상태 확인
    const token = localStorage.getItem("accessToken");
    //#NeedToChange 토큰에서 잘 뽑아왔다고 가정
    setIsLogin(true);
    setCurrentUserId("aaa");
    // if (token) {
    //   setIsLogin(true);
    //   // 현재 사용자 ID 설정 (실제로는 토큰에서 추출)
    //   setCurrentUserId("current_user_id");
    // }

  //   if (!token) {
  //   // 토큰이 없으면 즉시 리다이렉트
  //   alert("로그인이 필요한 서비스입니다.");
  //   navigate('/login');
  //   return;
  // }
  setLoading(false);
  }, []);

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

  if (!isLogin) {
    return null;
  }

  return (
    <div className={styles.Container}>
      <Sidebar menuItems={finalMenuItems} />

      <div className={styles.content}>
        <div className={styles.contentWrapper}>
          {/* 메인 상세 정보 */}
          <TravelmateDetailMain 
            postId={parseInt(postId)}
            isLogin={isLogin}
            currentUserId={currentUserId}
          />
          
          {/* 참여 멤버들 */}
          <TravelmateMembers 
            postId={parseInt(postId)}
          />
          
          {/* Q&A 섹션 */}
          <TravelmateQA 
            postId={parseInt(postId)}
            isLogin={isLogin}
            currentUserId={currentUserId}
          />
        </div>
      </div>
    </div>
  );
};

export default TravelmateDetailPage;