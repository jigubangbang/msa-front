import React, { useState, useRef, useEffect } from 'react';
import styles from './DateSelector.module.css';

export default function DateSelector({ onSubmit, reset }) {
  const [startYear, setStartYear] = useState(null);
  const [startMonth, setStartMonth] = useState(null);
  const [startDay, setStartDay] = useState(null);
  const [endYear, setEndYear] = useState(null);
  const [endMonth, setEndMonth] = useState(null);
  const [endDay, setEndDay] = useState(null);

  const [showYearDropdown, setShowYearDropdown] = useState('');
  const [showMonthDropdown, setShowMonthDropdown] = useState('');
  const [showDayDropdown, setShowDayDropdown] = useState('');

  const startYearRef = useRef(null);
  const startMonthRef = useRef(null);
  const startDayRef = useRef(null);
  const endYearRef = useRef(null);
  const endMonthRef = useRef(null);
  const endDayRef = useRef(null);

  const currentYear = new Date().getFullYear();
  const currentDate = {
    year: currentYear,
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
  };

  const years = Array.from({ length: 11 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const getDaysInMonth = (year, month) => {
    if (!year || !month) return [];
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const getAvailableEndYears = () => {
    if (!startYear) return years;
    return years.filter(year => year >= startYear);
  };

  const getAvailableEndMonths = () => {
    if (!endYear || !startYear) return months;
    if (endYear > startYear) return months;
    if (endYear === startYear && startMonth) {
      return months.filter(month => month >= startMonth);
    }
    return months;
  };

  const getAvailableEndDays = () => {
    if (!endYear || !endMonth || !startYear || !startMonth) {
      return getDaysInMonth(endYear, endMonth);
    }

    const allDays = getDaysInMonth(endYear, endMonth);

    if (endYear > startYear || endMonth > startMonth) {
      return allDays;
    }

    if (endYear === startYear && endMonth === startMonth && startDay) {
      return allDays.filter(day => day >= startDay);
    }

    return allDays;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        startYearRef.current && !startYearRef.current.contains(event.target) &&
        endYearRef.current && !endYearRef.current.contains(event.target)
      ) {
        setShowYearDropdown('');
      }
      if (
        startMonthRef.current && !startMonthRef.current.contains(event.target) &&
        endMonthRef.current && !endMonthRef.current.contains(event.target)
      ) {
        setShowMonthDropdown('');
      }
      if (
        startDayRef.current && !startDayRef.current.contains(event.target) &&
        endDayRef.current && !endDayRef.current.contains(event.target)
      ) {
        setShowDayDropdown('');
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const dateData = {
      startDate: startYear && startMonth && startDay ? {
        year: startYear,
        month: startMonth,
        day: startDay,
        dateString: `${startYear}-${String(startMonth).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`
      } : null,
      endDate: endYear && endMonth && endDay ? {
        year: endYear,
        month: endMonth,
        day: endDay,
        dateString: `${endYear}-${String(endMonth).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`
      } : null
    };
    onSubmit(dateData);
  }, [startYear, startMonth, startDay, endYear, endMonth, endDay, onSubmit]);

  useEffect(() => {
    if (reset) {
      // 모든 날짜 상태 초기화
      setStartYear(null);
      setStartMonth(null);
      setStartDay(null);
      setEndYear(null);
      setEndMonth(null);
      setEndDay(null);
      
      // 드롭다운 상태도 초기화
      setShowYearDropdown('');
      setShowMonthDropdown('');
      setShowDayDropdown('');
    }
  }, [reset]);

  const handleYearSelect = (year, type) => {
    if (type === 'start') {
      setStartYear(year);
      if (startMonth && getDaysInMonth(year, startMonth).length < startDay) {
        setStartDay(null);
      }
      if (endYear && year > endYear) {
        setEndYear(null);
        setEndMonth(null);
        setEndDay(null);
      } else if (endYear && year === endYear && startMonth && endMonth && startMonth > endMonth) {
        setEndMonth(null);
        setEndDay(null);
      } else if (endYear && year === endYear && startMonth && endMonth && startMonth === endMonth && startDay && endDay && startDay > endDay) {
        setEndDay(null);
      }
    } else {
      setEndYear(year);
      if (endMonth && getDaysInMonth(year, endMonth).length < endDay) {
        setEndDay(null);
      }
      if (startYear && year === startYear && startMonth && endMonth && startMonth > endMonth) {
        setEndMonth(null);
        setEndDay(null);
      }
    }
    setShowYearDropdown('');
  };

  const handleMonthSelect = (month, type) => {
    if (type === 'start') {
      setStartMonth(month);
      if (startYear && getDaysInMonth(startYear, month).length < startDay) {
        setStartDay(null);
      }
      if (endYear && startYear === endYear && endMonth && month > endMonth) {
        setEndMonth(null);
        setEndDay(null);
      } else if (endYear && startYear === endYear && endMonth && month === endMonth && startDay && endDay && startDay > endDay) {
        setEndDay(null);
      }
    } else {
      setEndMonth(month);
      if (endYear && getDaysInMonth(endYear, month).length < endDay) {
        setEndDay(null);
      }
      if (startYear && endYear === startYear && startMonth && month === startMonth && startDay && endDay && startDay > endDay) {
        setEndDay(null);
      }
    }
    setShowMonthDropdown('');
  };

  const handleDaySelect = (day, type) => {
    if (type === 'start') {
      setStartDay(day);
      if (endYear && startYear === endYear && endMonth && startMonth === endMonth && endDay && day > endDay) {
        setEndDay(null);
      }
    } else {
      setEndDay(day);
    }
    setShowDayDropdown('');
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        <div className={styles.column}>
          <div className={styles.formGroup}>
            <div ref={startYearRef} className={styles.dropdown}>
              <div 
                className={styles.dropdownButton}
                onClick={() => setShowYearDropdown(showYearDropdown === 'start' ? '' : 'start')}
              >
                {startYear || '년도 선택'}
                <span className={styles.arrow}>▼</span>
              </div>
              {showYearDropdown === 'start' && (
                <div className={styles.countryList}>
                  {years.filter(year => year >= currentDate.year).map(year => (
                    <div
                      key={year}
                      className={styles.countryItem}
                      onClick={() => handleYearSelect(year, 'start')}
                    >
                      {year}년
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.column}>
          <div className={styles.formGroup}>
            <div ref={startMonthRef} className={styles.dropdown}>
              <div 
                className={`${styles.dropdownButton} ${!startYear ? styles.disabled : ''}`}
                onClick={() => startYear && setShowMonthDropdown(showMonthDropdown === 'start' ? '' : 'start')}
              >
                {startMonth ? `${startMonth}월` : '월 선택'}
                <span className={styles.arrow}>▼</span>
              </div>
              {showMonthDropdown === 'start' && startYear && (
                <div className={styles.countryList}>
                  {(startYear === currentDate.year 
                    ? months.filter(month => month >= currentDate.month)
                    : months
                  ).map(month => (
                    <div
                      key={month}
                      className={styles.countryItem}
                      onClick={() => handleMonthSelect(month, 'start')}
                    >
                      {month}월
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.column}>
          <div className={styles.formGroup}>
            <div ref={startDayRef} className={styles.dropdown}>
              <div 
                className={`${styles.dropdownButton} ${!startYear || !startMonth ? styles.disabled : ''}`}
                onClick={() => startYear && startMonth && setShowDayDropdown(showDayDropdown === 'start' ? '' : 'start')}
              >
                {startDay ? `${startDay}일` : '일 선택'}
                <span className={styles.arrow}>▼</span>
              </div>
              {showDayDropdown === 'start' && startYear && startMonth && (
                <div className={styles.countryList}>
                  {(startYear === currentDate.year && startMonth === currentDate.month
                    ? getDaysInMonth(startYear, startMonth).filter(day => day >= currentDate.day)
                    : getDaysInMonth(startYear, startMonth)
                  ).map(day => (
                    <div
                      key={day}
                      className={styles.countryItem}
                      onClick={() => handleDaySelect(day, 'start')}
                    >
                      {day}일
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <span className={styles.separator}>부터</span>

        <div className={styles.column}>
          <div className={styles.formGroup}>
            <div ref={endYearRef} className={styles.dropdown}>
              <div 
                className={styles.dropdownButton}
                onClick={() => setShowYearDropdown(showYearDropdown === 'end' ? '' : 'end')}
              >
                {endYear || '년도 선택'}
                <span className={styles.arrow}>▼</span>
              </div>
              {showYearDropdown === 'end' && (
                <div className={styles.countryList}>
                  {getAvailableEndYears().map(year => (
                    <div
                      key={year}
                      className={styles.countryItem}
                      onClick={() => handleYearSelect(year, 'end')}
                    >
                      {year}년
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.column}>
          <div className={styles.formGroup}>
            <div ref={endMonthRef} className={styles.dropdown}>
              <div 
                className={`${styles.dropdownButton} ${!endYear ? styles.disabled : ''}`}
                onClick={() => endYear && setShowMonthDropdown(showMonthDropdown === 'end' ? '' : 'end')}
              >
                {endMonth ? `${endMonth}월` : '월 선택'}
                <span className={styles.arrow}>▼</span>
              </div>
              {showMonthDropdown === 'end' && endYear && (
                <div className={styles.countryList}>
                  {getAvailableEndMonths().map(month => (
                    <div
                      key={month}
                      className={styles.countryItem}
                      onClick={() => handleMonthSelect(month, 'end')}
                    >
                      {month}월
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.column}>
          <div className={styles.formGroup}>
            <div ref={endDayRef} className={styles.dropdown}>
              <div 
                className={`${styles.dropdownButton} ${!endYear || !endMonth ? styles.disabled : ''}`}
                onClick={() => endYear && endMonth && setShowDayDropdown(showDayDropdown === 'end' ? '' : 'end')}
              >
                {endDay ? `${endDay}일` : '일 선택'}
                <span className={styles.arrow}>▼</span>
              </div>
              {showDayDropdown === 'end' && endYear && endMonth && (
                <div className={styles.countryList}>
                  {getAvailableEndDays().map(day => (
                    <div
                      key={day}
                      className={styles.countryItem}
                      onClick={() => handleDaySelect(day, 'end')}
                    >
                      {day}일
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <span className={styles.separator}>까지</span>
      </div>
    </div>
  );
}
