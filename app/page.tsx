"use client";

import React from "react";
import styles from "./page.module.css";

const Home = () => {
  const categories = {

    "Function calling": "function-calling",

  };

  return (
    <main className={styles.main}>
      <div className={styles.title}>
        Using my own API keys, please don't exploit this.
      </div>
      <div className={styles.container}>

          <a className={styles.category} href={`/examples/function-calling`}>
            Access to Chat
          </a>
      </div>
    </main>
  );
};

export default Home;
