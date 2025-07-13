import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { TRAVELER_SIDEBAR } from "../../../../utils/sidebar";
import styles from './TravelmateDetailPage.module.css';
import Sidebar from "../../../../components/common/SideBar/SideBar";
import TravelmateDetailMain from '../../../../components/travelmateForm/TravelmateDetailMain/TravelmateDetailMain';
import TravelmateMembers from '../../../../components/travelmateForm/TravelmateMembers/TravelmateMembers';
import TravelmateQA from '../../../../components/travelmateForm/TravelmateQA/TravelmateQA';
import { jwtDecode } from 'jwt-decode';


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
    
    if (token) {
        try {
            const decoded = jwtDecode(token);
            
            const currentTime = Math.floor(Date.now() / 1000);
            if (decoded.exp && decoded.exp < currentTime) {
                localStorage.removeItem("accessToken");
                setIsLogin(false);
                setCurrentUserId(null);
                alert("로그인이 만료되었습니다.");
                navigate('/login');
                return;
            }
            
            setIsLogin(true);
            setCurrentUserId(decoded.sub || decoded.userId);
            
        } catch (error) {
            console.error("토큰 디코딩 오류:", error);
            localStorage.removeItem("accessToken");
            setIsLogin(false);
            setCurrentUserId(null);
            alert("로그인 정보가 유효하지 않습니다.");
            navigate('/login');
            return;
        }
    } else {
        // 토큰이 없으면 즉시 리다이렉트
        setIsLogin(false);
        setCurrentUserId(null);
        alert("로그인이 필요한 서비스입니다.");
        navigate('/login');
        return;
    }
    
    setLoading(false);
}, []);

  if (loading) {
    return (
      <div className={styles.Container}>
        <Sidebar menuItems={finalMenuItems} isLogin={isLogin}/>
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
      <Sidebar menuItems={finalMenuItems} isLogin={isLogin}/>

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