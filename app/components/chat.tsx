"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./chat.module.css";
import { AssistantStream } from "openai/lib/AssistantStream";
import Markdown from "react-markdown";
// @ts-expect-error - no types for this yet
import { AssistantStreamEvent } from "openai/resources/beta/assistants/assistants";
import { RequiredActionFunctionToolCall } from "openai/resources/beta/threads/runs/runs";

interface MessageProps {
  role: "user" | "assistant" | "code";
  text: string;
  graphId?: string;
  onSelectGraph?: (id: string) => void;
  isSelected?: boolean;
}

const UserMessage = ({ text }: { text: string }) => {
  return <div className={styles.userMessage}>{text}</div>;
};

const AssistantMessage = ({ 
  text, 
  graphId, 
  onSelectGraph,
  isSelected 
}: Omit<MessageProps, 'role'>) => {
  return (
    <div className={styles.assistantMessage}>
      <Markdown>{text}</Markdown>
      {graphId && (
        <button
          onClick={() => onSelectGraph?.(graphId)}
          className={`${styles.graphButton} ${isSelected ? styles.selected : ''}`}
        >
          Show Graph
        </button>
      )}
    </div>
  );
};

const CodeMessage = ({ text }: { text: string }) => {
  return (
    <div className={styles.codeMessage}>
      {text.split("\n").map((line, index) => (
        <div key={index}>
          <span>{`${index + 1}. `}</span>
          {line}
        </div>
      ))}
    </div>
  );
};

const Message = ({ role, text, graphId, onSelectGraph, isSelected }: MessageProps) => {
  switch (role) {
    case "user":
      return <UserMessage text={text} />;
    case "assistant":
      return <AssistantMessage text={text} graphId={graphId} onSelectGraph={onSelectGraph} isSelected={isSelected} />;
    case "code":
      return <CodeMessage text={text} />;
    default:
      return null;
  }
};

interface ChatProps {
  functionCallHandler?: (toolCall: RequiredActionFunctionToolCall) => Promise<string>;
  onSelectGraph?: (id: string) => void;
  selectedGraphId?: string | null;
}

interface ChatMessage {
  role: "user" | "assistant" | "code";
  text: string;
  graphId?: string;
}

const Chat = ({
  functionCallHandler = () => Promise.resolve(""),
  onSelectGraph,
  selectedGraphId
}: ChatProps) => {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [threadId, setThreadId] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const createThread = async () => {
      const res = await fetch(`/api/assistants/threads`, {
        method: "POST",
      });
      const data = await res.json();
      setThreadId(data.threadId);
    };
    createThread();
  }, []);

  const sendMessage = async (text: string) => {
    const response = await fetch(
      `/api/assistants/threads/${threadId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({
          content: text,
        }),
      }
    );
    const stream = AssistantStream.fromReadableStream(response.body);
    handleReadableStream(stream);
  };

  const submitActionResult = async (runId: string, toolCallOutputs: any[]) => {
    const isGraphCreation = toolCallOutputs.some(output => output.output === "");
    
    const response = await fetch(
      `/api/assistants/threads/${threadId}/actions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          runId: runId,
          toolCallOutputs: toolCallOutputs,
          skipCompletion: isGraphCreation
        }),
      }
    );

    if (isGraphCreation) {
      setInputDisabled(false);
      return;
    }

    const stream = AssistantStream.fromReadableStream(response.body);
    handleReadableStream(stream);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    sendMessage(userInput);
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", text: userInput },
    ]);
    setUserInput("");
    setInputDisabled(true);
    scrollToBottom();
  };

  const handleTextCreated = (text: any) => {
    const content = text.content?.[0]?.text?.value || '';
    if (content.includes('{"data":') || 
        content.includes('{"id":') ||
        content.includes('"datasets":') ||
        content.includes('"labels":') ||
        content.includes('data:image/')) {
      return;
    }
    appendMessage("assistant", "");
  };

  const handleTextDelta = (delta: any) => {
    const value = delta.value || '';
    if (value.includes('{"data":') || 
        value.includes('{"id":') ||
        value.includes('"datasets":') ||
        value.includes('"labels":') ||
        value.includes('data:image/')) {
      return;
    }
    if (delta.value != null) {
      appendToLastMessage(delta.value);
    }
  };

  const toolCallCreated = (toolCall: any) => {
    if (toolCall.type !== "code_interpreter" && toolCall.function?.name !== "create_graph") {
      appendMessage("code", "");
    }
  };

  const toolCallDelta = (delta: any, snapshot: any) => {
    if (delta.type !== "code_interpreter" && snapshot?.function?.name !== "create_graph") {
      if (delta.function?.arguments) {
        appendToLastMessage(delta.function.arguments);
      }
    }
  };

  const handleRequiresAction = async (
    event: AssistantStreamEvent.ThreadRunRequiresAction
  ) => {
    const runId = event.data.id;
    const toolCalls = event.data.required_action.submit_tool_outputs.tool_calls;
    const toolCallOutputs = await Promise.all(
      toolCalls.map(async (toolCall) => {
        if (toolCall.function?.name === "create_graph") {
          const result = await functionCallHandler(toolCall);
          const parsedResult = JSON.parse(result);
          if (parsedResult.id) {
            appendMessage("assistant", `Graph created: ${parsedResult.title || 'Untitled Graph'}`, parsedResult.id);
            return { 
              output: "",
              tool_call_id: toolCall.id 
            };
          }
        }
        const result = await functionCallHandler(toolCall);
        return { output: result, tool_call_id: toolCall.id };
      })
    );
    setInputDisabled(true);
    submitActionResult(runId, toolCallOutputs);
  };

  const handleRunCompleted = () => {
    setInputDisabled(false);
  };

  const handleReadableStream = (stream: AssistantStream) => {
    stream.on("textCreated", handleTextCreated);
    stream.on("textDelta", handleTextDelta);
    stream.on("toolCallCreated", toolCallCreated);
    stream.on("toolCallDelta", toolCallDelta);
    stream.on("event", (event) => {
      if (event.event === "thread.run.requires_action")
        handleRequiresAction(event);
      if (event.event === "thread.run.completed") handleRunCompleted();
    });
  };

  const appendToLastMessage = (text: string) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
        text: lastMessage.text + text,
      };
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  };

  const appendMessage = (role: ChatMessage['role'], text: string, graphId?: string) => {
    setMessages((prevMessages) => [...prevMessages, { role, text, graphId }]);
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messages}>
        {messages.map((msg, index) => (
          <Message 
            key={index} 
            {...msg} 
            onSelectGraph={onSelectGraph}
            isSelected={msg.graphId === selectedGraphId}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <input
          type="text"
          className={styles.input}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Write something..."
          disabled={inputDisabled}
        />
        <button type="submit" className={styles.button} disabled={inputDisabled}>
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
