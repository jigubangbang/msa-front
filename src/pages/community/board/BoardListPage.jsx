import React, { useEffect, useState} from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TRAVELER_SIDEBAR } from "../../../utils/sidebar";
import styles from "./BoardListPage.module.css";
import TravelerSearchBar from "../../../components/travelmate/TravelerSearchBar/TravelerSearchBar";
import Sidebar from "../../../components/common/SideBar/SideBar";
import { jwtDecode } from 'jwt-decode';
import BoardCategoryBrowse from "../../../components/board/BoardCategoryBrowse/BoardCategoryBrowse";
import BoardCard from "../../../components/board/BoardCard/BoardCard";
import BoardMainList from "../../../components/board/BoardMainList/BoardMainList";
import UserActivityBoard from "../../../components/board/UserActivityBoard/UserActivityBoard";
import BoardTravelStyleList from "../../../components/board/BoardTravelStyleList/BoardTravelStyleList";
import BoardSearchList from "../../../components/board/BoardSearchList/BoardSearchList";


export default function BoardListPage({page}) {
  const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [category, setCategory] = useState(null);

    const [currentUserId, setCurrentUserId] = useState('');

    const [isMain, setIsMain] = useState(false);

    //SideBar//
    const location = useLocation();
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
            
            const userRole = decoded.role || decoded.authorities;
            const isAdminUser = userRole === 'ROLE_ADMIN' ||
                                (Array.isArray(userRole) && userRole.includes('ROLE_ADMIN'));
            
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
    
    if (page) {
        // page 값에 따라 category 설정
        switch (page) {
            case "popular":
                setCategory([0]);
                setIsMain(true);
                break;
            case "info":
                setCategory([1]);
                setIsMain(false);
                break;
            case "recommend":
                setCategory([2]);
                setIsMain(false);
                break;
            case "chat":
                setCategory([3]);
                setIsMain(false);
                break;
            case "question":
                setCategory([4]);
                setIsMain(false);
                break;
            default:
                setCategory([]);
                setIsMain(false);
                break;
        }
    } else {
        setIsSearching(false);
        setCategory([]);
    }
}, [page]);

  const handleSearchStart = () => {
    setCategory([]);
    setCurrentPage(1);
  }

    const handleCategorySelect = (categoryId) => {
    console.log('선택된 카테고리 ID:', categoryId);
    
    if (category && category.includes(categoryId)) {
      setCategory([]);
    } else {
      setCategory([categoryId]);
    }

    setIsSearching(false); // 카테고리 선택 시에는 검색 모드 해제
    setCurrentPage(1);
    setSearchTerm('');
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

  return (
    <div className={styles.Container}>
      <Sidebar menuItems={finalMenuItems} isLogin={isLogin}/>

      <div className={styles.content}>
        <div className={styles.contentWrapper}>
          
          <TravelerSearchBar
                      placeholder="게시글 제목 및 내용을 검색하세요"
                      isSearch={isSearching}
                      setIsSearch={setIsSearching}
                      value={searchTerm}
                      onSearchChange={(value) => {
                        setSearchTerm(value);
                        handleSearchStart(); 
                      }}
                      barWidth = "80%"
                    />
          

          {!isSearching ? (
            <>
              <BoardCategoryBrowse 
                category={category}
                onCategorySelect={handleCategorySelect}
                isLogin={isLogin}
              />

              <BoardCard
                category={category}
                isLogin={isLogin}
                currentUserId={currentUserId}
              />

              {isMain && <BoardMainList isLogin={isLogin}/>}
              {( isLogin && isMain )&& <UserActivityBoard isLogin={isLogin} currentUserId={currentUserId}/>}

              {!isMain && <BoardTravelStyleList 
                category={category}
                isLogin={isLogin}
                currentUserId={currentUserId}
              />}
            </>
          ) : (
            <>
              <BoardSearchList searchKeyword={searchTerm} isLogin={isLogin}/>
            </>
          )}
        </div>
      </div>

    
    </div>
  );
}