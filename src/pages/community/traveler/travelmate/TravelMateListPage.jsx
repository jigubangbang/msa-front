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


export default function TravelMateListPage() {
  const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

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
    


  useEffect(()=>{
    const token = localStorage.getItem("accessToken");
    //#NeedToChange 토큰에서 잘 뽑아왔다고 가정
    setIsLogin(true);

    // if (token) {
    //   setIsLogin(true);
    // }
  }, []);

  const handleFilterSubmit = (filterData) => {
    setFilters(prev => {
      const newFilters = { ...prev, ...filterData };
      console.log(newFilters);
      return newFilters;
    });
    setCurrentPage(1);
}

const handleSearchSectionSubmit = (searchData) => {
    console.log('SearchSection에서 받은 데이터:', searchData);
    
    // SearchSection 데이터를 filters 형태로 변환
    const newFilters = {
      ...filters,
      locations: searchData.locations || [],
    };
    setSearchSectionData(searchData);
    setFilters(newFilters);
    setIsSearching(true);
    setCurrentPage(1);
    setSearchTerm('');
  };

  const handleCategorySelect = (filterData) => {
  console.log('카테고리에서 받은 필터 데이터:', filterData);
  
  setFilters(prev => {
    const newFilters = { ...prev, ...filterData };
    return newFilters;
  });
  
  setIsSearching(true);
  setCurrentPage(1);
  setSearchTerm('');
  setSearchSectionData(null);
};


  const onOpenPost = (postId) => {
    // 여행메이트 상세 페이지로 이동
    // navigate(`/travelmate/${postId}`);
    console.log("게시물로 이동 travel mate post id", postId);
  }

  const handleSearchStart = () => {
    setCurrentPage(1);
    setSearchSectionData(null);
  }



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
      <Sidebar menuItems={finalMenuItems}/>

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
            barWidth = "80%"
          />

          {!isSearching ? (
            <>
              <SearchSection onSubmit={handleSearchSectionSubmit}/>
              <CategoryBrowse onCategorySelect={handleCategorySelect}/>
              <p> 당신에게 잘 맞는 모임이에요 </p>
            </>
          ) : (<>
              <TravelmateFilter onSubmit={handleFilterSubmit}/>
              <TravelmateList
                isLogin={isLogin}
                onOpenPost={onOpenPost}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                filters={filters}
                setFilters={setFilters}
                showCompleted={showCompleted}
                searchSectionData={searchSectionData}
              />
            
          </>)}
        </div>
      </div>

    
    </div>
  );
}