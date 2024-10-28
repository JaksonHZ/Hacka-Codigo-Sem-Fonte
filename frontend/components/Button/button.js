'use client';   

import styles from "./button.module.css";
import { useState, useEffect } from "react";

export default function Button({primary = true, icon, text, onClick}) {

  return (
    <div className={styles.containerButton} style={primary ? {background: "#003B7A"} : {}} onClick={onClick}>
        {icon}

        <span style={{color: primary ? "#FFF" : "#003B7A"}}>{text}</span>
    </div>
  );
}
