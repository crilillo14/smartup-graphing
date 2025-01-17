"use client";

import React, { useState } from "react";
import styles from "../shared/page.module.css";
import Chat from "../../components/chat";
import GraphWidget from "../../components/graph-widget";
import { createGraph, type ChartType } from "../../utils/graph";
import { RequiredActionFunctionToolCall } from "openai/resources/beta/threads/runs/runs";
import { ChartData } from "chart.js";

interface GraphData {
  type?: ChartType;
  title?: string;
  data?: ChartData<ChartType>;
}

const FunctionCalling = () => {
  const [graphData, setGraphData] = useState<GraphData>({});
  const isEmpty = Object.keys(graphData).length === 0;

  const functionCallHandler = async (call: RequiredActionFunctionToolCall) => {
    if (call?.function?.name !== "create_graph") return;
    try {
      const args = JSON.parse(call.function.arguments);
      const data = createGraph(args);
      setGraphData(data);
      return JSON.stringify(data);
    } catch (error) {
      console.error('Error creating graph:', error);
      return JSON.stringify({ error: 'Failed to create graph' });
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.column}>
          <GraphWidget
            data={graphData.data}
            type={graphData.type}
            title={graphData.title}
            isEmpty={isEmpty}
          />
        </div>
        <div className={styles.chatContainer}>
          <div className={styles.chat}>
            <Chat functionCallHandler={functionCallHandler} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default FunctionCalling;
