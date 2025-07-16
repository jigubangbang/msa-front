import React from 'react';
import styles from './DotNav.module.css';

const DotNav = ({ sections, activeSection, onDotClick }) => {
  return (
    <div className={styles.dotNavContainer}>
      {sections.map((section) => (
        <div
          key={section.id}
          className={styles.dotWrapper}
          onClick={() => onDotClick(section.id)}
          title={section.title}
        >
          <div
            className={`${styles.dot} ${activeSection === section.id ? styles.active : ''}`}
          />
        </div>
      ))}
    </div>
  );
};

export default DotNav;
