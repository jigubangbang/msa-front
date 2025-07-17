import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { TRAVELER_SIDEBAR } from "../../../utils/sidebar";
import styles from './BoardListPage.module.css';
import Sidebar from "../../../components/common/SideBar/SideBar";
import api from '../../../apis/api';
import API_ENDPOINTS from '../../../utils/constants';
import BoardForm from '../../../components/board/BoardForm/BoardForm';
import { jwtDecode } from 'jwt-decode';

const BoardFormPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
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
                  navigate('/board/popular');
                  return;
              }
              
              const userId = decoded.sub || decoded.userId;
              setIsLogin(true);
              setCurrentUserId(userId);
              
              // 모드 결정: postId가 있으면 수정, 없으면 생성
              console.log('postId:', postId);
              if (postId) {
                  setMode('edit');
                  fetchBoardData(postId, userId); // userId를 직접 전달
              } else {
                  setMode('create');
                  setLoading(false);
              }
              
          } catch (error) {
              console.error("토큰 디코딩 오류:", error);
              localStorage.removeItem("accessToken");
              setIsLogin(false);
              setCurrentUserId(null);
              navigate('/board/popular');
              return;
          }
      } else {
          setIsLogin(false);
          setCurrentUserId(null);
          navigate('/board/popular');
          return;
      }
  }, [postId, navigate]);

  // fetchBoardData 함수 수정 - userId 파라미터 추가
  const fetchBoardData = async (id, userId) => {
    try {
        // 게시글 정보 조회
        const response = await api.get(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/board/${id}`);
        
        let postData;
        if (response.data && response.data.success && response.data.data) {
            postData = response.data.data;
        } else {
            postData = response.data;
        }

        // 작성자 권한 확인
        if (postData.userId !== userId) {
            alert('수정 권한이 없습니다.');
            navigate(`/board/${id}`);
            return;
        }
        
        // 이미지 정보 별도 조회
        let images = [];
        try {
            const imageResponse = await api.get(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/board/${id}/images`);
            images = imageResponse.data || [];
        } catch (imageError) {
            console.error('Failed to fetch images:', imageError);
            // 이미지 조회 실패해도 게시글은 수정할 수 있도록 함
            images = [];
        }
        
        // API 응답 데이터를 폼에 맞는 형태로 변환
        const formattedData = {
            title: postData.title || '',
            content: postData.content || '',
            boardId: postData.boardId?.toString() || '3',
            images: images
        };
        
        setInitialData(formattedData);
    } catch (error) {
        console.error('Failed to fetch board data:', error);
        alert('게시글 정보를 불러오는데 실패했습니다.');
        navigate('/board/popular');
    } finally {
        setLoading(false);
    }
};

  // 폼 제출 처리
  const handleFormSubmit = async (formData) => {
    console.log('Form data:', formData);
    try {
      if (mode === 'create') {
        // 새 게시글 생성
        const response = await api.post(
          `${API_ENDPOINTS.COMMUNITY.USER}/board`,
          formData,
          {
            headers: {
              'User-Id': currentUserId,
            },
          }
        );
                
        console.log('게시글이 생성되었습니다:', response.data);
        alert('게시글이 성공적으로 작성되었습니다!');
        
        // 생성된 게시글 상세 페이지로 이동
        const newPostId = response.data?.id || response.data?.data?.id;
        if (newPostId) {
          navigate(`/board/${newPostId}`);
        } else {
          navigate('/board/popular'); // 목록으로 이동
        }
        
      } else {
        // 기존 게시글 수정
        const response = await api.put(
          `${API_ENDPOINTS.COMMUNITY.USER}/board/${postId}`,
          formData,
          {
            headers: {
              'User-Id': currentUserId,
            },
          }
        );
        
        console.log('게시글이 수정되었습니다:', response.data);
        alert('게시글이 성공적으로 수정되었습니다!');
        
        // 수정된 게시글 상세 페이지로 이동
        navigate(`/board/${postId}`);
      }
      
    } catch (error) {
      console.error('게시글 저장 실패:', error);
      
      // 에러 메시지 처리
      let errorMessage = '게시글 저장에 실패했습니다.';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 403) {
        errorMessage = '권한이 없습니다.';
      } else if (error.response?.status === 404) {
        errorMessage = '게시글을 찾을 수 없습니다.';
      }
      
      alert(errorMessage);
      throw error; // BoardForm에서 로딩 상태 해제를 위해
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
          <div className={styles.loading}>로딩 중...</div>
        </div>
      </div>
    );
  }

  if (!isLogin) {
    return (
      <div className={styles.Container}>
        <Sidebar menuItems={finalMenuItems} isLogin={isLogin}/>
        <div className={styles.content}>
          <div className={styles.error}>로그인이 필요합니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.Container}>
      <Sidebar menuItems={finalMenuItems} isLogin={isLogin}/>
      
      <div className={styles.content}>
        <div className={styles.contentWrapper}>
          <BoardForm
            mode={mode}
            initialData={initialData}
            currentUserId={currentUserId}
            isLogin={isLogin}
            onSubmit={handleFormSubmit}
            onClose={handleFormClose}
          />
        </div>
      </div>
    </div>
  );
};

export default BoardFormPage;