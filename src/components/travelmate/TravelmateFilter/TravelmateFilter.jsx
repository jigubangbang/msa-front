import React, { useState, useRef, useEffect } from 'react';
import styles from './TravelmateFilter.module.css';
import LocationSelector from '../LocationSelector/LocationSelector';
import api from '../../../apis/api';
import API_ENDPOINTS from '../../../utils/constants';

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
        setThemes(themeResponse.data);

        // 여행 스타일 데이터 로딩
        const styleResponse = await api.get(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/travel-styles`);
        setTravelStyles(styleResponse.data);
      } catch (error) {
        console.error('Failed to fetch filter data:', error);
      }
    };

    fetchData();
  }, []);

  // 외부 클릭 감지
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     const clickedOutside = Object.values(filterRefs).every(ref => 
  //       ref.current && !ref.current.contains(event.target)
  //     );
      
  //     if (clickedOutside) {
  //       setActiveToggle(null);
  //     }
  //   };

  //   document.addEventListener('click', handleClickOutside);
  //   return () => document.removeEventListener('click', handleClickOutside);
  // }, []);

  // 필터 데이터 변경 시 부모에게 전달
  // useEffect(() => {
  //   onSubmit(selectedFilters);
  // }, [selectedFilters, onSubmit]);

  const handleApplyClick = () => {
    onSubmit(selectedFilters);
  };

  const handleToggleClick = (toggleType) => {
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
  };

  const resetAllFilters = () => {
    setSelectedFilters({
      locations: [],
      targets: [],
      themes: [],
      styles: []
    });
    setActiveToggle(null);
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
          
          {(selectedFilters.locations.length > 0 || 
            selectedFilters.targets.length > 0 || 
            selectedFilters.themes.length > 0 || 
            selectedFilters.styles.length > 0) && (
            <button type="button" className={styles.resetAllButton} onClick={resetAllFilters}>
              <img src="/icons/common/refresh.svg" alt="reset all"/>
            </button>
          )}
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
          <div className={styles.selector}>
            <LocationSelector onSubmit={handleLocationSubmit} />
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