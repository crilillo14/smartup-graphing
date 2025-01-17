"use client";

import React from "react";
import styles from "./page.module.css";
import { SpeedInsights } from "@vercel/speed-insights/next"
const Home = () => {
  const categories = {

    "Function calling": "function-calling",

  };

  return (
    <main className={styles.main}>
      <SpeedInsights />
      <div className={styles.title}>
        Visualizacion de datos dentro de un chat - para SmartUp
      </div>
      <p>hecho por Cristobal</p>
      <div className={styles.container}>

          <a className={styles.category} href={`/examples/function-calling`}>
            Click to access chat
          </a>
      </div>
      
    </main>
  );
};

export default Home;
