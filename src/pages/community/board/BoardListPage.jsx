import React, { useEffect, useState} from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TRAVELER_SIDEBAR } from "../../../utils/sidebar";
import styles from "./BoardListPage.module.css";
import TravelerSearchBar from "../../../components/travelmate/TravelerSearchBar/TravelerSearchBar";
import Sidebar from "../../../components/common/SideBar/SideBar";

export default function BoardListPage({page}) {
  const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [category, setCategory] = useState(null);

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
    


  useEffect(()=>{
    const token = localStorage.getItem("accessToken");
    //#NeedToChange 토큰에서 잘 뽑아왔다고 가정
    setIsLogin(true); //느낌표2개 token으로 주면 됨
    setCurrentUserId("aaa");


    if (page) {
        setIsSearching(true); // 검색 중으로 설정

        // page 값에 따라 category 설정
        switch (page) {
        case "popular":
            setCategory([0]);
            break;
        case "info":
            setCategory([1]);
            break;
        case "recommend":
            setCategory([2]);
            break;
        case "chat":
            setCategory([3]);
            break;
        case "question":
            setCategory([4]);
            break;
        default:
            setCategory([]);
            break;
        }
    } else {
        // /board 라면 전체 보기로 초기화
        setIsSearching(false);
        setCategory([]);
    }
    }, [page]);

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
      
      setCategory(prevCategory => {
          if (prevCategory.includes(categoryId)) {
          return prevCategory.filter(id => id !== categoryId);
          } else {
          return [...prevCategory, categoryId];
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

            //   <TravelInfoList
            // currentUserId={currentUserId}
            //   searchTerm={searchTerm}
            //   currentPage={currentPage}
            //   setCurrentPage={setCurrentPage}
            //   isLogin={isLogin}
            //   initialCategory={category} 
            // />
  return (
    <div className={styles.Container}>
      <Sidebar menuItems={finalMenuItems}/>

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

            </>
          ) : (
            <>
            
            </>
          )}
        </div>
      </div>

    
    </div>
  );
}