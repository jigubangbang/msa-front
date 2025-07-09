import React, { useEffect, useState} from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TRAVELER_SIDEBAR } from "../../../../utils/sidebar";
import styles from "./TravelMateListPage.module.css";
import Sidebar from "../../../../components/common/SideBar/SideBar";
import TravelerSearchBar from "../../../../components/travelmate/TravelerSearchBar/TravelerSearchBar";


export default function TravelMateListPage() {
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);


  //필터 옵션: 지역 대상 테마 여행 스타일
  const [filters, setFilters] = useState({
    location: [],
    target: [],
    theme: [],
    style: [],
    sortOption: 'default'
  });

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
            onSearchChange={(value) => setSearchTerm(value)}
            barWidth="400px"
          />
          <p> 어디로 갈거에요 바 </p>
          <p> 카테고리 별 둘러보기 </p>
          <p> 당신에게 잘 맞는 모임이에요 </p>

          <p> 검색 중일 때 </p>
          <p> 아예 검색하는 component로 가게 </p>
        </div>
      </div>

    
    </div>
  );
}