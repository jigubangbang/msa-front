import React, { useEffect, useState, useCallback } from "react";
import styles from "./SearchSection.module.css";
import LocationSelector from "../LocationSelector/LocationSelector";
import DateSelector from "../DateSelector/DateSelector";

export default function SearchSection({ onSubmit }) {
 const [selectedLocations, setSelectedLocations] = useState([]);
 const [selectedDates, setSelectedDates] = useState(null);

 const handleSubmit = () => {
   if (onSubmit) {
     // 검색 데이터 구성
     const searchData = {
       locations: selectedLocations,
       dates: selectedDates
     };
     
     console.log('검색 데이터:', searchData);
     
     // 부모 컴포넌트로 데이터 전달
     onSubmit(searchData);
   }
 }

 const handleDateSubmit = useCallback((dateData) => { 
   console.log('선택된 날짜:', dateData);
   setSelectedDates(dateData);
 }, []);

 const handleLocationSubmit = useCallback((locations) => {
   if (locations === 'ALL') {
     // 전체 선택된 경우의 처리
     console.log('모든 나라가 선택되었습니다');
     setSelectedLocations(['ALL']);
   } else {
     // 일반적인 위치 목록 처리
     console.log('선택된 위치들:', locations);
     setSelectedLocations(locations);
   }
 }, []);

 return (
   <div className={styles.container}>
     <div className={styles.content}>
       <div className={styles.Container}>
         <h2 className={styles.title}>어디로 떠나실건가요?</h2>
         <div className={styles.selector}>
           <LocationSelector onSubmit={handleLocationSubmit}/>
           <DateSelector onSubmit={handleDateSubmit}/>
         </div>
         <div className={styles.buttonDiv}>
           <button className={`${styles.button} ${styles.darkButton}`}
             onClick={handleSubmit}
           >나에게 딱 맞는 여행자 동행 모임 검색하기</button>
         </div>
       </div>
     </div>
   </div>
 );
}