import React, { useEffect, useState} from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TRAVELER_SIDEBAR } from "../../../../utils/sidebar";
import styles from "./TravelMateListPage.module.css";
import Sidebar from "../../../../components/common/SideBar/SideBar";
import TravelerSearchBar from "../../../../components/travelmate/TravelerSearchBar/TravelerSearchBar";
import SearchSection from "../../../../components/travelmate/SearchSection/SearchSection";
import TravelmateFilter from "../../../../components/travelmate/TravelmateFilter/TravelmateFilter";
import TravelmateList from "../../../../components/travelmate/TravelmateList/TravelmateList";
import CategoryBrowse from "../../../../components/travelmate/CategoryBrowse/CategoryBrowse";
import TopTravelmateList from "../../../../components/travelmate/TopTravelmateList/TopTravelmateList";
import { jwtDecode } from "jwt-decode";
import CirclesSpinner from "../../../../components/common/Spinner/CirclesSpinner";


export default function TravelMateListPage() {
  const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
      locations: [],
      targets: [],
      themes: [],
      styles: [],
      continent: [],
      sortOption: 'default'
    });

    const defaultFilters = {
      locations: [],
      targets: [],
      themes: [],
      styles: [],
      continent: [],
      sortOption: 'default'
    };

    //흠
    const showCompleted = false;

    const [searchSectionData, setSearchSectionData] = useState(null);

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
            // JWT 토큰 디코딩
            const decoded = jwtDecode(token);
            
            // 토큰 만료 확인
            const currentTime = Math.floor(Date.now() / 1000);
            if (decoded.exp && decoded.exp < currentTime) {
                // 토큰 만료됨
                localStorage.removeItem("accessToken");
                setIsLogin(false);
                return;
            }
            
            // 로그인 상태 설정
            setIsLogin(true);
            
            setCurrentUserId(decoded.sub || decoded.userId);
            // setUserRole(decoded.role);
            
        } catch (error) {
            console.error("토큰 디코딩 오류:", error);
            // 토큰이 유효하지 않으면 제거하고 로그아웃 처리
            localStorage.removeItem("accessToken");
            setIsLogin(false);
        }
    } else {
        // 토큰이 없으면 로그아웃 상태
        setIsLogin(false);
    }
}, []);

  const handleFilterSubmit = (filterData) => {
    setFilters(prev => {
      const newFilters = { ...prev, ...filterData };
      console.log(newFilters);
      return newFilters;
    });
    setCurrentPage(1);
    setIsSearching(true);
    setSearchSectionData(null);
}

const handleSearchSectionSubmit = (searchData) => {
  console.log('SearchSection에서 받은 데이터:', searchData);
  
  const newFilters = {
    ...defaultFilters,
    sortOption: filters.sortOption || 'default'
  };
  
  setSearchSectionData(searchData); 
  setFilters(newFilters); 
  setIsSearching(true);
  setCurrentPage(1);
  setSearchTerm('');
};

  const handleCategorySelect = (filterData) => {
    window.scroll(0,0);
  console.log('카테고리에서 받은 필터 데이터:', filterData);
  
  const newFilters = {
    ...defaultFilters,
    ...filterData,
    sortOption: filters.sortOption || 'default' // 정렬 옵션 유지
  };
  
  setFilters(newFilters);
  
  setIsSearching(true);
  setCurrentPage(1);
  setSearchTerm('');
  setSearchSectionData(null);
};



  const handleSearchStart = () => {
    setCurrentPage(1);
    setFilters(defaultFilters);
    setFilters({});
    setSearchSectionData(null);
  }

  const handleViewAll = () => {
    window.scroll(0,0);
    setIsSearching(true);
    setCurrentPage(1);
    setSearchTerm('');
    setSearchSectionData(null);
    setFilters(defaultFilters);
  }

  const handlePostClick = (postId) => {
    navigate(`/traveler/mate/${postId}`);
  }



 if (loading) {
    return (
      <div className={styles.Container}>
        <Sidebar menuItems={finalMenuItems} isLogin={isLogin}/>
        <div className={styles.content}>
          <CirclesSpinner/>
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
            placeholder="어디로 떠나고 싶으세요?"
            isSearch={isSearching}
            setIsSearch={setIsSearching}
            value={searchTerm}
            onSearchChange={(value) => {
              setSearchTerm(value);
              handleSearchStart(); 
            }}
          />

          {!isSearching ? (
            <>
              <SearchSection onSubmit={handleSearchSectionSubmit}/>
              <CategoryBrowse onCategorySelect={handleCategorySelect}/>
              {/* 현재 인기 여행 동행 모임 */}
              <TopTravelmateList
                currentUserId={currentUserId}
                title="인기 여행자 모임"
                option="popular"
                isLogin={isLogin}
                onViewAll={handleViewAll}
                onPostClick={handlePostClick}
              />

              {/* 최근 만들어진 여행 동행 모임 */}
              <TopTravelmateList
              currentUserId={currentUserId}
                title="최신 등록 여행자 모임"
                option="recent"
                isLogin={isLogin}
                onViewAll={handleViewAll}
                onPostClick={handlePostClick}
              />
            </>
          ) : (<>
              <TravelmateFilter onSubmit={handleFilterSubmit}/>
              <TravelmateList
                isLogin={isLogin}
                onOpenPost={handlePostClick}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                filters={filters}
                setFilters={setFilters}
                showCompleted={showCompleted}
                searchSectionData={searchSectionData}
                currentUserId={currentUserId}
              />
            
          </>)}
        </div>
      </div>

    
    </div>
  );
}