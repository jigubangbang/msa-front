import React, { useState, useRef, useEffect } from 'react';
import styles from './LocationSelector.module.css';
import api from '../../../apis/api';
import API_ENDPOINTS from '../../../utils/constants';

export default function LocationSelector({ onSubmit, locationOpen, locationClose, reset }) {
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState([]);
  
  const countryRef = useRef(null);
  const cityRef = useRef(null);

  // reset prop 감지해서 상태 초기화
  useEffect(() => {
    if (reset) {
      setSelectedLocations([]);
      setSelectedCountry(null);
      setSelectedCity(null);
      setCities([]);
      setShowCountryDropdown(false);
      setShowCityDropdown(false);
      onSubmit([]);
    }
  }, [reset]);

  // 국가 목록 가져오기
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await api.get(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/countries`);
        setCountries(response.data);
      } catch (error) {
        console.error('Failed to fetch countries:', error);
      }
    };
    fetchCountries();
  }, []);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryRef.current && !countryRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
      }
      if (cityRef.current && !cityRef.current.contains(event.target)) {
        setShowCityDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [locationClose]);

  // 국가 선택 시 해당 도시들 가져오기
  const handleCountrySelect = async (country) => {
    setSelectedCountry(country);
    setSelectedCity(null);
    setShowCountryDropdown(false);

    if(locationClose){
      locationClose();
    }

    if (country.id === 'ALL') {
      setCities([]);
    return;
  }
    
    try {
      const response = await api.get(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/cities/${country.id}`);
      setCities(response.data);
    } catch (error) {
      console.error('Failed to fetch cities:', error);
      setCities([]);
    }
  };

  const handleCitySelect = (city) => {
  setSelectedCity(city);
  setShowCityDropdown(false);

      if(locationClose){
      locationClose();
    }
  
  if (selectedCountry && city) {
    if (city.id === 'ALL') {
      const newLocation = {
        id: `${selectedCountry.id}-ALL`,
        country: selectedCountry,
        city: { ...city, cityName: `전체` }
      };

      // 중복 확인 (같은 나라의 "전체" 선택이 이미 있는지)
      const isAlreadySelected = selectedLocations.some(
        location => location.country.id === selectedCountry.id && location.city.id === 'ALL'
      );
      
      if (!isAlreadySelected) {
        const updatedLocations = [...selectedLocations, newLocation];
        setSelectedLocations(updatedLocations);
        onSubmit(updatedLocations);
      }
    } else {
      // 일반 도시 선택 (기존 로직)
      const newLocation = {
        id: `${selectedCountry.id}-${city.id}`,
        country: selectedCountry,
        city: city
      };
      
      const isAlreadySelected = selectedLocations.some(
        location => location.country.id === selectedCountry.id && location.city.id === city.id
      );
      
      if (!isAlreadySelected) {
        const updatedLocations = [...selectedLocations, newLocation];
        setSelectedLocations(updatedLocations);
        onSubmit(updatedLocations);
      }
    }
    
    // 선택 초기화
    setSelectedCountry(null);
    setSelectedCity(null);
    setCities([]);
  }
};

  const removeLocation = (locationId) => {
    const updatedLocations = selectedLocations.filter(location => location.id !== locationId);
    setSelectedLocations(updatedLocations);
    onSubmit(updatedLocations);
  };

  const handleCountryDropdownToggle = () => {
    if (showCountryDropdown && locationClose){
      locationClose();
    }
    if (!showCountryDropdown && locationOpen){
      locationOpen();
    }
    setShowCountryDropdown(!showCountryDropdown);
    
  };

const handleCityDropdownToggle = () => {
  if (selectedCountry && selectedCountry.id !== 'ALL') {
    if (showCityDropdown && locationClose) {
      locationClose();
    }
    if (!showCityDropdown && locationOpen) {
      locationOpen();
    }
    setShowCityDropdown(!showCityDropdown);
  }
};

  return (
    <div className={styles.wrapper}>
      {/* 국가와 도시 선택을 나란히 배치 */}
      <div className={styles.row}>
        {/* 국가 선택 드롭다운 */}
        <div className={styles.column}>
            <label className={styles.label}>나라 선택</label>
        </div>

        <div className={styles.column}>
          <div className={styles.formGroup}>
            
            <div ref={countryRef} className={styles.dropdown}>
                
              <div 
                className={styles.dropdownButton}
               onClick={handleCountryDropdownToggle}
              >
                {selectedCountry ? selectedCountry.name : '나라 선택'}
                <span className={styles.arrow}>▼</span>
              </div>
              {showCountryDropdown && (
                <div className={styles.countryList}>
                  {countries.map(country => (
                    <div
                      key={country.id}
                      className={styles.countryItem}
                      onClick={() => handleCountrySelect(country)}
                    >
                      {country.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 도시 선택 드롭다운 */}
        <div className={styles.column}>
            <label className={styles.label}>도시 선택</label>
        </div>
        <div className={styles.column}>
          <div className={styles.formGroup}>
            <div ref={cityRef} className={styles.dropdown}>
              <div 
                className={`${styles.dropdownButton} ${!selectedCountry || selectedCountry.id === 'ALL' ? styles.disabled : ''}`}
                onClick={handleCityDropdownToggle}
              >
                {selectedCity ? selectedCity.cityName : '도시 선택'}
                <span className={styles.arrow}>▼</span>
              </div>
              {showCityDropdown && selectedCountry && cities.length > 0 && (
                <div className={styles.countryList}>
                  {cities.map(city => (
                    <div
                      key={city.id}
                      className={styles.countryItem}
                      onClick={() => handleCitySelect(city)}
                    >
                      {city.cityName}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>



      {/* 추가된 위치들과 리셋 버튼 */}
      <div className={styles.addedSection}>

        <div className={styles.addedLocations}>
          {selectedLocations.map(location => (
            <div key={location.id} className={styles.locationTag}>
              {location.country.name} {location.city.cityName}
              <button 
                className={styles.btn + ' ' + styles.btnOutline}
                onClick={() => removeLocation(location.id)}
              >
                <img src="/icons/common/close.svg" alt="close"/>
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}