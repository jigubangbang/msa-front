import React from "react";
import { Circles } from "react-loader-spinner";
import styles from "./CirclesSpinner.module.css";

export default function CirclesSpinner({ height = 50, width = 50, color = "#000" }) {
  return (
    <div className={styles.spinnerContainer}>
      <Circles height={height} width={width} color={color} ariaLabel="circles-loading" />
    </div>
  );
}
