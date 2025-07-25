import React, { useState, useRef, useEffect } from 'react';
import styles from './TravelmateFilter.module.css';
import LocationSelector from '../LocationSelector/LocationSelector';
import api from '../../../apis/api';
import API_ENDPOINTS from '../../../utils/constants';

const getDisplayName = (originalName) => {
  const nameMapping = {
    '맛집 탐방 여행 모임': '맛집 탐방 모임',
    '등산/트레킹 여행 모임': '등산/트레킹 모임',
    '사진 찍기 여행 모임': '사진 촬영 모임',
    '역사/문화 유적지 탐방 모임': '유적지 탐방 모임',
    '축제/이벤트 참가 여행 모임': '축제/이벤트 참가 모임',
    '자연 속 힐링 여행 모임': '자연 속 힐링 모임',
    '액티비티/레포츠 여행 모임': '액티비티/레포츠 모임',
    '캠핑/차박 여행 모임': '캠핑/차박 모임'
  };
  
  return nameMapping[originalName] || originalName;
};

export default function TravelmateFilter({ onSubmit }) {
  const [activeToggle, setActiveToggle] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    locations: [],
    targets: [],
    themes: [],
    styles: []
  });

  // 데이터 상태
  const [targets, setTargets] = useState([]);
  const [themes, setThemes] = useState([]);
  const [travelStyles, setTravelStyles] = useState([]);

  const [locationOpen, setLocationOpen] = useState(false);
  const [locationReset, setLocationReset] = useState(false);

  const filterRefs = {
    location: useRef(null),
    target: useRef(null),
    theme: useRef(null),
    style: useRef(null)
  };

  // 데이터 로딩
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 대상 데이터 로딩
        const targetResponse = await api.get(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/targets`);
        setTargets(targetResponse.data);

        // 테마 데이터 로딩
        const themeResponse = await api.get(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/themes`);

        // 이름 매핑 처리
        const mappedThemes = themeResponse.data.map(theme => ({
          ...theme,
          label: getDisplayName(theme.label)
        }));

        setThemes(mappedThemes);

        // 여행 스타일 데이터 로딩
        const styleResponse = await api.get(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/travel-styles`);
        setTravelStyles(styleResponse.data);
      } catch (error) {
        console.error('Failed to fetch filter data:', error);
      }
    };

    fetchData();
  }, []);

  const handleApplyClick = () => {
    onSubmit(selectedFilters);
  };

  const handleToggleClick = (toggleType) => {
    if (activeToggle === toggleType) {
    setLocationOpen(false);
  }
    setActiveToggle(activeToggle === toggleType ? null : toggleType);
  };

  const handleLocationSubmit = (locations) => {
    setSelectedFilters(prev => ({
      ...prev,
      locations
    }));
  };

  const handleTargetSelect = (target) => {
    const isSelected = selectedFilters.targets.some(t => t.id === target.id);
    
    setSelectedFilters(prev => ({
      ...prev,
      targets: isSelected 
        ? prev.targets.filter(t => t.id !== target.id)
        : [...prev.targets, target]
    }));
  };

  const handleThemeSelect = (theme) => {
    const isSelected = selectedFilters.themes.some(t => t.id === theme.id);
    
    setSelectedFilters(prev => ({
      ...prev,
      themes: isSelected 
        ? prev.themes.filter(t => t.id !== theme.id)
        : [...prev.themes, theme]
    }));
  };

  const handleStyleSelect = (style) => {
    const isSelected = selectedFilters.styles.some(s => s.id === style.id);
    
    setSelectedFilters(prev => ({
      ...prev,
      styles: isSelected 
        ? prev.styles.filter(s => s.id !== style.id)
        : [...prev.styles, style]
    }));
  };

  const resetFilter = (filterType) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: []
    }));

    if (filterType === 'locations') {
      setLocationReset(true);
      setTimeout(() => setLocationReset(false), 100);
    }
  };

  const resetAllFilters = () => {
    const newFilters = { 
      locations: [],
      targets: [],
      themes: [],
      styles: []
    };
    setSelectedFilters(newFilters);
    setActiveToggle(null);
    setLocationOpen(false);
    onSubmit(newFilters);
  };

  const getToggleText = (filterType) => {
    const filterData = selectedFilters[filterType];
    
    if (filterData.length === 0) {
      const labels = {
        locations: '지역',
        targets: '대상',
        themes: '테마',
        styles: '여행 스타일'
      };
      return labels[filterType];
    }

    if (filterType === 'locations') {
      const firstLocation = filterData[0];
      const locationText = `${firstLocation.country.name} ${firstLocation.city.cityName}`;
      return filterData.length > 1 
        ? `${locationText} 외 ${filterData.length - 1}곳`
        : locationText;
    }

    const firstItem = filterData[0];
    return filterData.length > 1 
      ? `${firstItem.label} 외 ${filterData.length - 1}개`
      : firstItem.label;
  };

  const removeFilterItem = (filterType, itemId) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].filter(item => item.id !== itemId)
    }));
  };

  const handleLocationOpen = () => {
    console.log('Location opening...');
    setLocationOpen(true);
  }

  const handleLocationClose = () => {
    console.log('Location closing...');
    setLocationOpen(false);
  }

  return (
    <div className={styles.wrapper}>
      {/* 토글 버튼들 */}
      <div className={styles.toggleSection}>
        {/* 지역 토글 */}
        <div ref={filterRefs.location} className={styles.filterToggle}>
          <button 
          type="button"
            className={`${styles.toggleButton} ${activeToggle === 'location' ? styles.active : ''}`}
            onClick={() => handleToggleClick('location')}
          >
            {getToggleText('locations')}
            <span className={styles.arrow}>▼</span>
          </button>
        </div>

        {/* 대상 토글 */}
        <div ref={filterRefs.target} className={styles.filterToggle}>
          <button 
          type="button"
            className={`${styles.toggleButton} ${activeToggle === 'target' ? styles.active : ''}`}
            onClick={() => handleToggleClick('target')}
          >
            {getToggleText('targets')}
            <span className={styles.arrow}>▼</span>
          </button>
        </div>

        {/* 테마 토글 */}
        <div ref={filterRefs.theme} className={styles.filterToggle}>
          <button 
          type="button"
            className={`${styles.toggleButton} ${activeToggle === 'theme' ? styles.active : ''}`}
            onClick={() => handleToggleClick('theme')}
          >
            {getToggleText('themes')}
            <span className={styles.arrow}>▼</span>
          </button>
        </div>

        {/* 여행 스타일 토글 */}
        <div ref={filterRefs.style} className={styles.filterToggle}>
          <button 
          type="button"
            className={`${styles.toggleButton} ${activeToggle === 'style' ? styles.active : ''}`}
            onClick={() => handleToggleClick('style')}
          >
            {getToggleText('styles')}
            <span className={styles.arrow}>▼</span>
          </button>
        </div>

        <div className={styles.buttonDiv}>
        <button type="button" className={styles.resetAllButton} onClick={resetAllFilters}>
          <img src="/icons/common/refresh.svg" alt="reset all"/>
        </button>
        <button type="button" className={`${styles.button} ${styles.darkButton}`} onClick={handleApplyClick}>적용</button>
        </div>
      </div>

      {/* 선택된 필터들 표시 (토글이 활성화되었을 때만) */}
      {activeToggle && (selectedFilters.locations.length > 0 || 
        selectedFilters.targets.length > 0 || 
        selectedFilters.themes.length > 0 || 
        selectedFilters.styles.length > 0) && (
        <div className={styles.selectedSection}>
          <div className={styles.selectedFilters}>
            {Object.entries(selectedFilters).map(([key, items]) => 
              items.map(item => (
                <div key={`${key}-${item.id}`} className={styles.selectedTag}>
                  {key === 'locations' 
                    ? `${item.country.name} ${item.city.cityName}`
                    : item.label
                  }
                  <button 
                    type="button"
                    className={styles.removeButton}
                    onClick={() => removeFilterItem(key, item.id)}
                  >
                    <img src="/icons/common/close.svg" alt="remove"/>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 각 토글별 컨텐츠 패널 */}
      {activeToggle === 'location' && (
        <div className={styles.contentPanel}>
          <div className={styles.panelHeader}>
            <span>지역 선택</span>
            <button 
            type="button"
              className={styles.resetButton}
              onClick={() => resetFilter('locations')}
            >
              <img src="/icons/common/refresh.svg" alt="reset"/>
            </button>
          </div>
          <div className={locationOpen ? styles.selectorLocation : styles.selector}>
            <LocationSelector key="location-selector" onSubmit={handleLocationSubmit} locationOpen={handleLocationOpen} locationClose={handleLocationClose} reset={locationReset}/>
          </div>
        </div>
      )}

      {activeToggle === 'target' && (
        <div className={styles.contentPanel}>
          <div className={styles.panelHeader}>
            <span>대상 선택</span>
            <button 
            type="button"
              className={styles.resetButton}
              onClick={() => resetFilter('targets')}
            >
              <img src="/icons/common/refresh.svg" alt="reset"/>
            </button>
          </div>
          <div className={styles.optionGrid}>
            {targets.map(target => (
              <button
              type="button"
                key={target.id}
                className={`${styles.optionButton} ${
                  selectedFilters.targets.some(t => t.id === target.id) ? styles.selected : ''
                }`}
                onClick={() => handleTargetSelect(target)}
              >
                {target.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeToggle === 'theme' && (
        <div className={styles.contentPanel}>
          <div className={styles.panelHeader}>
            <span>테마 선택</span>
            <button 
            type="button"
              className={styles.resetButton}
              onClick={() => resetFilter('themes')}
            >
              <img src="/icons/common/refresh.svg" alt="reset"/>
            </button>
          </div>
          <div className={styles.optionGrid}>
            {themes.map(theme => (
              <button
              type="button"
                key={theme.id}
                className={`${styles.optionButton} ${
                  selectedFilters.themes.some(t => t.id === theme.id) ? styles.selected : ''
                }`}
                onClick={() => handleThemeSelect(theme)}
              >
                {theme.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeToggle === 'style' && (
        <div className={styles.contentPanel}>
          <div className={styles.panelHeader}>
            <span>여행 스타일 선택</span>
            <button 
            type="button"
              className={styles.resetButton}
              onClick={() => resetFilter('styles')}
            >
              <img src="/icons/common/refresh.svg" alt="reset"/>
            </button>
          </div>
          <div className={styles.optionGrid}>
            {travelStyles.map(style => (
              <button
              type="button"
                key={style.id}
                className={`${styles.optionButton} ${
                  selectedFilters.styles.some(s => s.id === style.id) ? styles.selected : ''
                }`}
                onClick={() => handleStyleSelect(style)}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}