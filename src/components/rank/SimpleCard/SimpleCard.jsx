import React, { useState } from 'react';
import styles from './SimpleCard.module.css';


const SimpleCard = ({ 
  title, 
  count
}) => {

  return (
    <div className={styles.simpleCard}>

      <div className={styles.content}>
        <h2 className={styles.title}>
          {title}
        </h2>
      </div>
      <p className={styles.count}>
        {count}
      </p>
    </div>
  );
};

export default SimpleCard;