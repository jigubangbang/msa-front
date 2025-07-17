import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { TRAVELER_SIDEBAR } from "../../../../utils/sidebar";
import styles from './TravelMateListPage.module.css';
import Sidebar from "../../../../components/common/SideBar/SideBar";
import api from '../../../../apis/api';
import API_ENDPOINTS from '../../../../utils/constants';
import TravelmateForm from '../../../../components/travelmate/TravelmateForm/TravelmateForm';
import { jwtDecode } from 'jwt-decode';


const TravelmateFormPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [mode, setMode] = useState('create'); // 'create' or 'edit'
  const [initialData, setInitialData] = useState(null);

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
                return;
            }
            
            setIsLogin(true);
            setCurrentUserId(decoded.sub || decoded.userId);
            
        } catch (error) {
            console.error("토큰 디코딩 오류:", error);
            localStorage.removeItem("accessToken");
            setIsLogin(false);
            setCurrentUserId(null);
        }
    } else {
        setIsLogin(false);
        setCurrentUserId(null);
    }
    
    // 모드 결정: postId가 있으면 수정, 없으면 생성
    console.log(postId);
    if (postId) {
        setMode('edit');
        fetchTravelmateData(postId);
    } else {
        setMode('create');
        setLoading(false);
    }
}, [postId]);

  // 기존 모임 데이터 조회 (수정 모드용)
  const fetchTravelmateData = async (id) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/travelmate/${id}`);
      const data = response.data.travelmate;
      
      // API 응답 데이터를 폼에 맞는 형태로 변환
      const formattedData = {
        ...data,
        // 위치 데이터 변환 (API 응답에 따라 조정 필요)
        locations: data.locations || [],
        targets: data.targets || [],
        themes: data.themes || [],
        styles: data.styles || []
      };
      
      setInitialData(formattedData);
    } catch (error) {
      console.error('Failed to fetch travelmate data:', error);
      alert('모임 정보를 불러오는데 실패했습니다.');
      navigate('/traveler/mate'); // 목록으로 돌아가기
    } finally {
      setLoading(false);
    }
  };

  // 폼 제출 처리
  const handleFormSubmit = async (formData) => {
    console.log(formData);
    try {
      if (mode === 'create') {
        // 새 모임 생성
        const response = await api.post(
          `${API_ENDPOINTS.COMMUNITY.USER}/travelmate`,
          formData,
          {
            headers: {
              'User-Id': currentUserId,
            },
          }
        );
                
        console.log('모임이 생성되었습니다:', response.data);
        alert('모임이 성공적으로 생성되었습니다!');
        
        // 생성된 모임 상세 페이지로 이동
        if (response.data.travelmateId) {
          navigate(`/traveler/mate/${response.data.travelmateId}`);
        } else {
          navigate('/traveler/mate'); // 목록으로 이동
        }
        
      } else {
        // 기존 모임 수정
        const response = await api.put(
          `${API_ENDPOINTS.COMMUNITY.USER}/travelmate/${postId}`,
          formData,
          {
            headers: {
              'User-Id': currentUserId,
            },
          }
        );
        
        console.log('모임이 수정되었습니다:', response.data);
        alert('모임이 성공적으로 수정되었습니다!');
        
        // 수정된 모임 상세 페이지로 이동
        navigate(`/traveler/mate/${postId}`);
      }
      
    } catch (error) {
      console.error('모임 저장 실패:', error);
      
      // 에러 메시지 처리
      let errorMessage = '모임 저장에 실패했습니다.';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 403) {
        errorMessage = '권한이 없습니다.';
      } else if (error.response?.status === 404) {
        errorMessage = '모임을 찾을 수 없습니다.';
      }
      
      alert(errorMessage);
      throw error; // TravelmateForm에서 로딩 상태 해제를 위해
    }
  };

  // 폼 닫기/취소
  const handleFormClose = () => {
    // 이전 페이지로 돌아가거나 목록으로 이동
    if (postId) {
      navigate(`/traveler/mate/${postId}`); // 수정 모드였다면 상세 페이지로
    } else {
      navigate('/traveler/mate'); // 생성 모드였다면 목록으로
    }
  };

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
          <TravelmateForm
            mode={mode}
            initialData={initialData}
            onSubmit={handleFormSubmit}
            onClose={handleFormClose}
          />
        </div>
      </div>
    </div>
  );
};

export default TravelmateFormPage;