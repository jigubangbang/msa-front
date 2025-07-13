import React, { useEffect, useState} from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TRAVELER_SIDEBAR } from "../../../../utils/sidebar";
import styles from "./InfoListPage.module.css";
import Sidebar from "../../../../components/common/SideBar/SideBar";
import TravelerSearchBar from "../../../../components/travelmate/TravelerSearchBar/TravelerSearchBar";
import InfoCategoryBrowse from "../../../../components/travelinfo/InfoCategoryBrowse/InfoCategoryBrowse";
import TopTravelInfoList from "../../../../components/travelinfo/TopTravelInfoList/TopTravelInfoList";
import TravelInfoList from "../../../../components/travelinfo/TravelInfoList/TravelInfoList";
import { jwtDecode } from "jwt-decode";


export default function InfoListPage() {
  const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [categories, setCategories] = useState([]);

    const [currentUserId, setCurrentUserId] = useState('');


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

    console.log("토큰", token);
    
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
}, []);


  const handleSearchStart = () => {
    setCategories([]);
    setCurrentPage(1);
  }

  const handleViewAll = () => {
        setIsSearching(true);
        setCurrentPage(1);
        setSearchTerm('');
    }

    const handleCategorySelect = (categoryId) => {
      console.log('선택된 카테고리 ID:', categoryId);
      
      setCategories(prevCategories => {
          if (prevCategories.includes(categoryId)) {
          return prevCategories.filter(id => id !== categoryId);
          } else {
          return [...prevCategories, categoryId];
          }
      });

      setIsSearching(true);
        setCurrentPage(1);
        setSearchTerm('');
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
                currentUserId={currentUserId}
                  title="인기 정보 공유방"
                  option="popular"
                  isLogin={isLogin}
                  onViewAll={handleViewAll}
                />

                <TopTravelInfoList
                currentUserId={currentUserId}
                  title="최근 등록 정보 공유방"
                  option="recent"
                  isLogin={isLogin}
                  onViewAll={handleViewAll}
                />

                <TopTravelInfoList
                currentUserId={currentUserId}
                  title="활발한 정보 공유방"
                  option="active"
                  isLogin={isLogin}
                  onViewAll={handleViewAll}
                />
            </>
          ) : (
            <TravelInfoList
            currentUserId={currentUserId}
              searchTerm={searchTerm}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              isLogin={isLogin}
              initialCategories={categories} 
            />
          )}
        </div>
      </div>

    
    </div>
  );
}