import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { TRAVELER_SIDEBAR } from "../../../../utils/sidebar";
import styles from './InfoListPage.module.css';
import Sidebar from "../../../../components/common/SideBar/SideBar";
import api from '../../../../apis/api';
import API_ENDPOINTS from '../../../../utils/constants';
import TravelInfoForm from '../../../../components/travelinfo/TravelInfoForm/TravelInfoForm';
import { jwtDecode } from 'jwt-decode';
import ConfirmModal from '../../../../components/common/ErrorModal/ConfirmModal';
import CirclesSpinner from "../../../../components/common/Spinner/CirclesSpinner";


const InfoFormPage = () => {
  const { infoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [mode, setMode] = useState('create'); // 'create' or 'edit'
  const [initialData, setInitialData] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmType, setConfirmType] = useState('alert');
  const [confirmAction, setConfirmAction] = useState(null);

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
    
    // 모드 결정: infoId가 있으면 수정, 없으면 생성
    console.log(infoId);
    if (infoId) {
        setMode('edit');
        fetchTravelInfoData(infoId);
    } else {
        setMode('create');
        setLoading(false);
    }
}, [infoId]);

const showAlertModal = (message) => {
    setConfirmMessage(message);
    setConfirmType('alert');
    setConfirmAction(null);
    setShowConfirmModal(true);
  };

  const hideConfirm = () => {
    setShowConfirmModal(false);
    setConfirmMessage('');
    setConfirmAction(null);
  };

  const handleConfirmAction = () => {
    if (confirmAction) {
      confirmAction();
    }
    hideConfirm();
  };


  // 기존 정보방 데이터 조회 (수정 모드용)
  const fetchTravelInfoData = async (id) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/travelinfo/${id}`);
      const data = response.data.travelinfo;
      
      // API 응답 데이터를 폼에 맞는 형태로 변환
      const formattedData = {
        ...data,
        // 테마 데이터 변환 (API 응답에 따라 조정 필요)
        themeIds: data.themeIds || data.themes || [],
        // 기타 필드들
        title: data.title || '',
        simpleDescription: data.simpleDescription || '',
        enterDescription: data.enterDescription || '',
        thumbnailImage: data.thumbnailImage || null
      };
      
      setInitialData(formattedData);
    } catch (error) {
      console.error('Failed to fetch travelinfo data:', error);
      showAlertModal('정보 공유방 데이터를 불러오는데 실패했습니다.');
      navigate('/traveler/info'); // 목록으로 돌아가기
    } finally {
      setLoading(false);
    }
  };

  // 폼 제출 처리
  const handleFormSubmit = async (formData) => {
    console.log(formData);
    try {
      if (mode === 'create') {
        // 새 정보방 생성
        const response = await api.post(
          `${API_ENDPOINTS.COMMUNITY.USER}/travelinfo`,
          formData,
      {
        headers: {
          'User-Id': currentUserId,
        },
      }
        );
        
        console.log('정보방이 생성되었습니다:', response.data);
        showAlertModal('정보방이 성공적으로 생성되었습니다!');
        
        // 생성된 정보방 상세 페이지로 이동
        navigate('/traveler/info'); // 목록으로 이동
        
      } else {
        // 기존 정보방 수정
        const response = await api.put(
          `${API_ENDPOINTS.COMMUNITY.USER}/travelinfo/${infoId}`,
          formData,
      {
        headers: {
          'User-Id': currentUserId,
        },
      }
        );
        
        console.log('정보방이 수정되었습니다:', response.data);
        showAlertModal('정보방이 성공적으로 수정되었습니다!');

        navigate(`/traveler/my/travelinfo`);
      }
      
    } catch (error) {
      console.error('정보방 저장 실패:', error);
      
      // 에러 메시지 처리
      let errorMessage = '정보방 저장에 실패했습니다.';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 403) {
        errorMessage = '권한이 없습니다.';
      } else if (error.response?.status === 404) {
        errorMessage = '정보방을 찾을 수 없습니다.';
      }
      
      showAlertModal(errorMessage);
      throw error; // TravelInfoForm에서 로딩 상태 해제를 위해
    }
  };

  

  // 폼 닫기/취소
  const handleFormClose = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className={styles.Container}>
        <Sidebar menuItems={finalMenuItems} isLogin={isLogin}/>
        <div className={styles.content}>
          <CirclesSpinner height={50} width={50} color="#000" />
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
          <TravelInfoForm
            mode={mode}
            initialData={initialData}
            onSubmit={handleFormSubmit}
            onClose={handleFormClose}
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={hideConfirm}
        onConfirm={confirmAction ? handleConfirmAction : null}
        message={confirmMessage}
        type={confirmType}
      />

    </div>
  );
};

export default InfoFormPage;