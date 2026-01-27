// src/types/chat.ts

export type ChatMessage = {
  role: "user" | "ai";
  text: string;
};

export type Chat = {
  id: string;           // unique chat id
  title: string;        // sidebar me dikhane ke liye
  messages: ChatMessage[];
  createdAt: number;
};
