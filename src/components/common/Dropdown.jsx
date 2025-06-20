import React, {useState, useRef, useEffect} from 'react';
import styles from "./Dropdown.module.css";

export default function Dropdown({defaultOption="", options=[], onSelect}) {
    const dropdownRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [dropdownLabel, setDropdownLabel] = useState(defaultOption);
    
    function handleClick(option) {
        setDropdownLabel(option.label);
        setOpen(false);
        if (onSelect) {
            onSelect(option);
        }
    }
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef}>
            <button className={styles.dropdownToggle} onClick={() => {setOpen(!open)}}>
                {dropdownLabel}
                <span className={`${styles.arrow} ${open ? styles.arrowOpen : ''}`}>▾</span>
            </button>

            {open && (
                <div className={styles.dropdownMenu}>
                    {options.map((option) => (
                        <div 
                        key={option.label}
                        className={styles.dropdownItem} 
                        onMouseDown={(e) => {
                            e.preventDefault(); // prevent focus/blur bugs
                            handleClick(option);
                        }}>
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}