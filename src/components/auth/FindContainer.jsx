import React from "react";
import styles from "./FindContainer.module.css";

const FindContainer = ({ title, showResult, children }) => {
  return (
    <div className={styles.findPage}>
      <div className={styles.findContainer}>
        <div className={styles.findHeader}>
          <div className={styles.logo}>{title}</div>
        </div>
        
        {children}
      </div>
    </div>
  );
};

export default FindContainer;