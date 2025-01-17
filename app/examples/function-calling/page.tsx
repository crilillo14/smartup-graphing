"use client";

import React, { useState } from "react";
import styles from "../shared/page.module.css";
import Chat from "../../components/chat";
import GraphWidget from "../../components/graph-widget";
import { createGraph, type ChartType } from "../../utils/graph";
import { RequiredActionFunctionToolCall } from "openai/resources/beta/threads/runs/runs";
import { ChartData } from "chart.js";
import { SpeedInsights } from "@vercel/speed-insights/next"

interface GraphData {
  id: string;
  type?: ChartType;
  title?: string;
  data?: ChartData<ChartType>;
}

const FunctionCalling = () => {
  const [graphHistory, setGraphHistory] = useState<GraphData[]>([]);
  const [selectedGraphId, setSelectedGraphId] = useState<string | null>(null);
  
  const currentGraph = selectedGraphId 
    ? graphHistory.find(g => g.id === selectedGraphId)
    : graphHistory[graphHistory.length - 1];
    
  const isEmpty = graphHistory.length === 0;

  const functionCallHandler = async (call: RequiredActionFunctionToolCall) => {
    if (call?.function?.name !== "create_graph") return;
    try {
      const args = JSON.parse(call.function.arguments);
      const data = createGraph(args);
      const newGraph = {
        ...data,
        id: Date.now().toString()
      };
      setGraphHistory(prev => [...prev, newGraph]);
      setSelectedGraphId(newGraph.id);
      return JSON.stringify({ ...data, id: newGraph.id });
    } catch (error) {
      console.error('Error creating graph:', error);
      return JSON.stringify({ error: 'Failed to create graph' });
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <SpeedInsights />
        <div className={styles.column}>
          <GraphWidget
            data={currentGraph?.data}
            type={currentGraph?.type}
            title={currentGraph?.title}
            isEmpty={isEmpty}
          />
        </div>
        <div className={styles.chatContainer}>
          <div className={styles.chat}>
            <Chat 
              functionCallHandler={functionCallHandler}
              onSelectGraph={setSelectedGraphId}
              selectedGraphId={selectedGraphId}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default FunctionCalling;
