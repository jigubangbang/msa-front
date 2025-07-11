import React, { useEffect, useState} from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TRAVELER_SIDEBAR } from "../../../../utils/sidebar";
import styles from "./InfoListPage.module.css";
import Sidebar from "../../../../components/common/SideBar/SideBar";
import TravelerSearchBar from "../../../../components/travelmate/TravelerSearchBar/TravelerSearchBar";
import InfoCategoryBrowse from "../../../../components/travelinfo/InfoCategoryBrowse/InfoCategoryBrowse";
import TopTravelInfoList from "../../../../components/travelinfo/TopTravelInfoList/TopTravelInfoList";


export default function InfoListPage() {
  const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [category, setCategory] = useState([]);

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


  const handleSearchStart = () => {
    setCategory([]);
    setCurrentPage(1);
  }

  const handleViewAll = () => {
        setIsSearching(true);
        setCurrentPage(1);
        setSearchTerm('');
    }

    const handleCategorySelect = (categoryId) => {
    console.log('선택된 카테고리 ID:', categoryId);
    
    setCategory(prevCategories => {
        if (prevCategories.includes(categoryId)) {
        return prevCategories.filter(id => id !== categoryId);
        } else {
        return [...prevCategories, categoryId];
        }
    });
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
      <Sidebar menuItems={finalMenuItems}/>

      <div className={styles.content}>
        <div className={styles.contentWrapper}>
          
          <TravelerSearchBar
                      placeholder="어떤 정보가 필요하세요?"
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
                <InfoCategoryBrowse onCategorySelect={handleCategorySelect} />

                <TopTravelInfoList
                  title="인기 정보 공유방"
                  option="popular"
                  isLogin={isLogin}
                />

                <TopTravelInfoList
                  title="최근 등록 정보 공유방"
                  option="recent"
                  isLogin={isLogin}
                />

                <TopTravelInfoList
                  title="활발한 정보 공유방"
                  option="active"
                  isLogin={isLogin}
                />
            </>
          ) : (
            <p> 검색 결과 </p>
          )}
        </div>
      </div>

    
    </div>
  );
}