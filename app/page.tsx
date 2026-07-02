"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { Chat, ChatMessage } from "../types/chat";
import { Personality, personalityThemeMap } from "../types/personality";
import { detectMemory } from "@/lib/memory";

import Sidebar from "./components/Sidebar";
import ChatPanel from "./components/ChatPanel";
import WidgetPanel from "./components/WidgetPanel";
import DesktopVisualizer from "./components/DesktopVisualizer";
import VoiceMode from "./components/VoiceMode";
import Header from "./components/Header";
import LandingPage from "./components/LandingPage";
import NeuralOrb from "./components/NeuralOrb";
import MemoryVault from "./components/MemoryVault";
import AmbientPlayer from "./components/AmbientPlayer";
import OnboardingModal from "./components/OnboardingModal";
import DynamicBackground from "./components/DynamicBackground";
import { motion, AnimatePresence } from "framer-motion";
import { HUDConfig, DEFAULT_HUD_CONFIG, DEFAULT_MOBILE_HUD_CONFIG, DEFAULT_TABLET_HUD_CONFIG, HUDComponentConfig } from "../types/hud";

type AIState = "idle" | "listening" | "thinking" | "speaking";

const stripEmojis = (text: string): string => {
  return text
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{E000}-\u{F8FF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
};

const getSpeechParameters = (text: string, personality: Personality) => {
  let pitch = 1.1;
  let rate = 0.95;

  switch (personality) {
    case "romantic":
      pitch = 1.05;
      rate = 0.88;
      break;
    case "caring":
      pitch = 1.08;
      rate = 0.92;
      break;
    case "playful":
      pitch = 1.15;
      rate = 1.05;
      break;
    case "angry":
      pitch = 1.18;
      rate = 1.05;
      break;
    case "command":
      pitch = 1.0;
      rate = 1.0;
      break;
    default:
      pitch = 1.1;
      rate = 0.95;
      break;
  }

  const lowerText = text.toLowerCase();
  
  if (
    lowerText.includes("yay") ||
    lowerText.includes("omg") ||
    lowerText.includes("excited") ||
    lowerText.includes("so happy") ||
    lowerText.includes("love it") ||
    text.endsWith("!")
  ) {
    pitch += 0.05;
    rate += 0.08;
  } else if (
    lowerText.includes("sorry") ||
    lowerText.includes("sad") ||
    lowerText.includes("tired") ||
    lowerText.includes("hurt") ||
    lowerText.includes("cry") ||
    lowerText.includes("miss you")
  ) {
    pitch -= 0.05;
    rate -= 0.07;
  } else if (
    lowerText.includes("stop") ||
    lowerText.includes("don't") ||
    lowerText.includes("ugh") ||
    lowerText.includes("annoyed") ||
    lowerText.includes("angry") ||
    lowerText.includes("hmph")
  ) {
    pitch += 0.08;
    rate += 0.05;
  }

  pitch = Math.max(0.5, Math.min(2.0, pitch));
  rate = Math.max(0.5, Math.min(2.0, rate));

  return { pitch, rate };
};

const playConnectionSound = (connected: boolean) => {
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  const t = ctx.currentTime;
  
  if (connected) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(523.25, t); // C5
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.05, t + 0.05);
    
    osc.frequency.setValueAtTime(659.25, t + 0.1); // E5
    gain.gain.setValueAtTime(0.05, t + 0.1);
    gain.gain.linearRampToValueAtTime(0, t + 0.25);
    
    osc.start(t);
    osc.stop(t + 0.25);
  } else {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(392.00, t); // G4
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.setValueAtTime(0, t + 0.08);
    
    osc.frequency.setValueAtTime(349.23, t + 0.1); // F4
    gain.gain.setValueAtTime(0.05, t + 0.1);
    gain.gain.setValueAtTime(0, t + 0.18);
    
    osc.frequency.setValueAtTime(261.63, t + 0.2); // C4
    gain.gain.setValueAtTime(0.05, t + 0.2);
    gain.gain.linearRampToValueAtTime(0, t + 0.35);
    
    osc.start(t);
    osc.stop(t + 0.35);
  }
};

const widgetLabels: Record<string, string> = {
  header: "👑 Header Bar",
  sidebar: "📁 Sidebar (Sessions)",
  chat: "💬 Chat Panel",
  visualizer: "🪐 AIVatar Visualizer",
  todo: "📝 Todo List",
  songs: "🎵 Music Player",
  memory: "🧠 Memory Vault",
  todoToggle: "📋 Todo Toggle Button",
  songsToggle: "🎧 Music Toggle Button",
  memoryToggle: "🧠 Memory Toggle Button",
  customizerToggle: "🎨 HUD Editor Button",
};

const personalityRGB: Record<Personality, string> = {
  normal: "34, 211, 238",
  romantic: "244, 114, 182",
  caring: "52, 211, 153",
  playful: "250, 204, 21",
  angry: "248, 113, 113",
  command: "167, 139, 250",
};

export default function Page() {
  const { user, loading } = useAuth();
  const [state, setState] = useState<AIState>("idle");
  const [theme] = useState<"dark" | "light">("dark");
  const [isMobile, setIsMobile] = useState(false);
  const [isUnder1280, setIsUnder1280] = useState(false);
  const [inputText, setInputText] = useState("");
  const [voiceMode, setVoiceMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [personality, setPersonality] = useState<Personality>("normal");
  const [subtitle, setSubtitle] = useState("");
  const [ytVideoQuery, setYtVideoQuery] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [memoryVaultOpen, setMemoryVaultOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [globalMemory, setGlobalMemory] = useState<Record<string, string>>({});
  const [ambientPlayerOpen, setAmbientPlayerOpen] = useState(false);
  const [affectionScore, setAffectionScore] = useState(30); // Default to Acquaintance (30)
  const [hudConfig, setHudConfig] = useState<HUDConfig>(DEFAULT_HUD_CONFIG);
  const [unlockedWidgets, setUnlockedWidgets] = useState<Record<string, boolean>>({});
  const [contextMenu, setContextMenu] = useState<{
    widget: keyof HUDConfig;
    x: number;
    y: number;
  } | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressActiveRef = useRef<boolean>(false);
  const longPressPosRef = useRef<{ x: number; y: number } | null>(null);
  const contextMenuOpenTimeRef = useRef<number>(0);

  const getEventCoords = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if ("touches" in e && e.touches.length > 0) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    } else if ("changedTouches" in e && e.changedTouches.length > 0) {
      return { clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY };
    } else {
      const mouseEvt = e as MouseEvent | React.MouseEvent;
      return { clientX: mouseEvt.clientX, clientY: mouseEvt.clientY };
    }
  };

  const startLongPress = (e: React.MouseEvent | React.TouchEvent, widget: keyof HUDConfig) => {
    if ("button" in e && e.button !== 0) return;
    if (unlockedWidgets[widget]) return;

    const { clientX, clientY } = getEventCoords(e);
    
    longPressPosRef.current = { x: clientX, y: clientY };
    longPressActiveRef.current = false;
    
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    
    longPressTimerRef.current = setTimeout(() => {
      longPressActiveRef.current = true;
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      contextMenuOpenTimeRef.current = Date.now();
      setContextMenu({
        widget,
        x: clientX,
        y: clientY,
      });
    }, 700);
  };

  const moveLongPress = (e: React.MouseEvent | React.TouchEvent) => {
    if (!longPressPosRef.current) return;
    const { clientX, clientY } = getEventCoords(e);
    
    const dx = clientX - longPressPosRef.current.x;
    const dy = clientY - longPressPosRef.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > 10) {
      cancelLongPress();
    }
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressPosRef.current = null;
  };

  const endLongPress = (e: React.MouseEvent | React.TouchEvent) => {
    if (longPressActiveRef.current) {
      e.preventDefault();
      e.stopPropagation();
      setTimeout(() => {
        longPressActiveRef.current = false;
      }, 50);
    }
    cancelLongPress();
  };

  const handleContextMenu = (e: React.MouseEvent, widget: keyof HUDConfig) => {
    e.preventDefault();
    e.stopPropagation();
    contextMenuOpenTimeRef.current = Date.now();
    setContextMenu({
      widget,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleWidgetDoubleClick = (e: React.MouseEvent, widget: keyof HUDConfig) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "BUTTON" ||
      target.closest("button") ||
      target.closest("input") ||
      target.closest("textarea")
    ) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    contextMenuOpenTimeRef.current = Date.now();
    setContextMenu({
      widget,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleBackgroundContextMenu = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      e.preventDefault();
      contextMenuOpenTimeRef.current = Date.now();
      setContextMenu({
        widget: "background" as any,
        x: e.clientX,
        y: e.clientY,
      });
    }
  };

  useEffect(() => {
    if (contextMenu) {
      const closeMenu = () => {
        if (Date.now() - contextMenuOpenTimeRef.current < 300) return;
        setContextMenu(null);
      };
      window.addEventListener("click", closeMenu);
      window.addEventListener("touchstart", closeMenu);
      return () => {
        window.removeEventListener("click", closeMenu);
        window.removeEventListener("touchstart", closeMenu);
      };
    }
  }, [contextMenu]);

  const [activeDrag, setActiveDrag] = useState<string | null>(null);
  const dragStartRef = useRef<{ clientX: number; clientY: number; startX: number; startY: number } | null>(null);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);

  const activeDragRef = useRef<string | null>(null);
  activeDragRef.current = activeDrag;

  const isMobileRef = useRef<boolean>(false);
  isMobileRef.current = isMobile;

  const hudConfigRef = useRef<HUDConfig>(hudConfig);
  hudConfigRef.current = hudConfig;

  const startDrag = useCallback((e: React.MouseEvent | React.TouchEvent, widget: string) => {
    setActiveDrag(widget);
    const { clientX, clientY } = getEventCoords(e);
    
    const mobile = isMobileRef.current;
    const defaultConfig = mobile ? DEFAULT_MOBILE_HUD_CONFIG : DEFAULT_HUD_CONFIG;
    const targetConfig = hudConfigRef.current[widget as keyof HUDConfig] || defaultConfig[widget as keyof HUDConfig];
    
    dragStartRef.current = {
      clientX,
      clientY,
      startX: targetConfig.x,
      startY: targetConfig.y,
    };
    e.preventDefault();
  }, []);

  const onDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    const currentActiveDrag = activeDragRef.current;
    if (!currentActiveDrag || !dragStartRef.current) return;
    const { clientX, clientY } = getEventCoords(e);

    const dx = clientX - dragStartRef.current.clientX;
    const dy = clientY - dragStartRef.current.clientY;

    const dxPercent = (dx / window.innerWidth) * 100;
    const dyPercent = (dy / window.innerHeight) * 100;

    let newX = Math.max(0, Math.min(98, dragStartRef.current.startX + dxPercent));
    let newY = Math.max(0, Math.min(95, dragStartRef.current.startY + dyPercent));

    newX = Math.round(newX);
    newY = Math.round(newY);

    if (Math.abs(newX - 50) <= 1.5) {
      newX = 50;
    }
    if (Math.abs(newY - 50) <= 1.5) {
      newY = 50;
    }

    const mobile = isMobileRef.current;
    const defaultConfig = mobile ? DEFAULT_MOBILE_HUD_CONFIG : DEFAULT_HUD_CONFIG;
    const currentHUD = hudConfigRef.current;
    for (const key of Object.keys(currentHUD)) {
      if (key === currentActiveDrag) continue;
      const cfg = currentHUD[key as keyof HUDConfig] || defaultConfig[key as keyof HUDConfig];
      if (!cfg.visible) continue;

      if (Math.abs(newX - cfg.x) <= 1.5) {
        newX = cfg.x;
      }
      if (Math.abs(newY - cfg.y) <= 1.5) {
        newY = cfg.y;
      }
    }

    setHudConfig((prev) => {
      const targetWidgetConfig = prev[currentActiveDrag as keyof HUDConfig] || defaultConfig[currentActiveDrag as keyof HUDConfig];
      const updatedConfig = {
        ...prev,
        [currentActiveDrag]: {
          ...targetWidgetConfig,
          x: newX,
          y: newY,
        },
      };
      const configKey = mobile ? "bubu_mobile_hud_config" : "bubu_hud_config";
      localStorage.setItem(configKey, JSON.stringify(updatedConfig));
      return updatedConfig;
    });
  }, []);

  const stopDrag = useCallback(() => {
    setActiveDrag(null);
    dragStartRef.current = null;
  }, []);

  // Bind mouse/touch move and up events to window during active drag
  useEffect(() => {
    if (activeDrag) {
      window.addEventListener("mousemove", onDragMove);
      window.addEventListener("mouseup", stopDrag);
      window.addEventListener("touchmove", onDragMove, { passive: false });
      window.addEventListener("touchend", stopDrag);
    }
    return () => {
      window.removeEventListener("mousemove", onDragMove);
      window.removeEventListener("mouseup", stopDrag);
      window.removeEventListener("touchmove", onDragMove);
      window.removeEventListener("touchend", stopDrag);
    };
  }, [activeDrag, onDragMove, stopDrag]);

  const updateWidgetConfig = (widget: keyof HUDConfig, updates: Partial<HUDComponentConfig>) => {
    const defaultConfig = isMobile ? DEFAULT_MOBILE_HUD_CONFIG : DEFAULT_HUD_CONFIG;
    const targetConfig = hudConfig[widget] || defaultConfig[widget];
    const updated = {
      ...hudConfig,
      [widget]: {
        ...targetConfig,
        ...updates,
      },
    };
    setHudConfig(updated);
    const configKey = isMobile ? "bubu_mobile_hud_config" : "bubu_hud_config";
    localStorage.setItem(configKey, JSON.stringify(updated));
  };

  const handleBackgroundDoubleClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      contextMenuOpenTimeRef.current = Date.now();
      setContextMenu({
        widget: "background" as any,
        x: e.clientX,
        y: e.clientY,
      });
    }
  };

  const handleBackgroundTouchStart = (e: React.TouchEvent) => {
    if (e.target !== e.currentTarget) return;
    const { clientX, clientY } = getEventCoords(e);
    touchStartPosRef.current = { x: clientX, y: clientY };
    
    if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
    
    touchTimeoutRef.current = setTimeout(() => {
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      contextMenuOpenTimeRef.current = Date.now();
      setContextMenu({
        widget: "background" as any,
        x: clientX,
        y: clientY,
      });
    }, 700);
  };

  const handleBackgroundTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPosRef.current) return;
    const { clientX, clientY } = getEventCoords(e);
    const dx = clientX - touchStartPosRef.current.x;
    const dy = clientY - touchStartPosRef.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > 10) {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
        touchTimeoutRef.current = null;
      }
    }
  };

  const handleBackgroundTouchEnd = () => {
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }
    touchStartPosRef.current = null;
  };

  const [widgetPanelOpen, setWidgetPanelOpen] = useState(false);
  const [todos, setTodos] = useState<{ id: string; text: string; completed: boolean }[]>([]);
  const [notes, setNotes] = useState("");

  const globalMemoryRef = useRef<Record<string, string>>({});
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const onboardingDone = localStorage.getItem("bubu_onboarding_completed");
    if (!onboardingDone) {
      setOnboardingOpen(true);
    }
    const savedAffection = localStorage.getItem("bubu_affection_score");
    if (savedAffection !== null) {
      setAffectionScore(Number(savedAffection));
    }
    const savedTodos = localStorage.getItem("bubu_widget_todo");
    if (savedTodos !== null) {
      try {
        setTodos(JSON.parse(savedTodos));
      } catch {}
    }
    const savedNotes = localStorage.getItem("bubu_widget_notes");
    if (savedNotes !== null) {
      setNotes(savedNotes);
    }
    
    // Load HUD config responsively based on current viewport width
    const width = window.innerWidth;
    const mobile = width < 768;
    const tablet = width >= 768 && width < 1280;
    const configKey = mobile 
      ? "bubu_mobile_hud_config" 
      : tablet 
        ? "bubu_tablet_hud_config" 
        : "bubu_hud_config";
    const defaultConfig = mobile 
      ? DEFAULT_MOBILE_HUD_CONFIG 
      : tablet 
        ? DEFAULT_TABLET_HUD_CONFIG 
        : DEFAULT_HUD_CONFIG;
    const savedHUDConfig = localStorage.getItem(configKey);
    if (savedHUDConfig !== null) {
      try {
        setHudConfig({ ...defaultConfig, ...JSON.parse(savedHUDConfig) });
      } catch {
        setHudConfig(defaultConfig);
      }
    } else {
      setHudConfig(defaultConfig);
    }
  }, []);

  const updateHUDConfig = (newConfig: HUDConfig) => {
    setHudConfig(newConfig);
    const configKey = isMobile 
      ? "bubu_mobile_hud_config" 
      : isUnder1280 
        ? "bubu_tablet_hud_config" 
        : "bubu_hud_config";
    localStorage.setItem(configKey, JSON.stringify(newConfig));
  };

  const updateAffection = (sentimentShift: number) => {
    setAffectionScore((prev) => {
      const next = Math.max(0, Math.min(100, prev + sentimentShift));
      localStorage.setItem("bubu_affection_score", String(next));
      return next;
    });
  };

  useEffect(() => {
    globalMemoryRef.current = globalMemory;
  }, [globalMemory]);

  const triggerVoiceMode = (v: boolean) => {
    if (v) {
      setIsIncomingCall(false);
    }
    setVoiceMode(v);
  };

  const handleToggleWidgetPanel = (open: boolean) => {
    setWidgetPanelOpen(open);
    if (open) {
      setMemoryVaultOpen(false);
      setAmbientPlayerOpen(false);
    }
  };

  const handleToggleAmbientPlayer = (open: boolean) => {
    setAmbientPlayerOpen(open);
    if (open) {
      setWidgetPanelOpen(false);
      setMemoryVaultOpen(false);
    }
  };

  const handleToggleMemoryVault = (open: boolean) => {
    setMemoryVaultOpen(open);
    if (open) {
      setWidgetPanelOpen(false);
      setAmbientPlayerOpen(false);
    }
  };

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const currentChatMemoryRef = useRef<Record<string, string>>({});
  const lastSpeakingEndTimeRef = useRef<number>(0);

  const currentChat = chats.find((c) => c.id === currentChatId) || null;

  useEffect(() => {
    currentChatMemoryRef.current = currentChat?.memory || {};
  }, [currentChat]);
  const chatHistory: ChatMessage[] = currentChat?.messages || [];
  const isDark = theme === "dark";
  const isTyping = state === "thinking";
  const themeStyles = personalityThemeMap[personality];

  const energyLevel = (() => {
    switch (state) {
      case "listening":
        return 0.6;
      case "thinking":
        return 0.8;
      case "speaking":
        return 1;
      default:
        return 0.25;
    }
  })();

  const snapLines = useMemo(() => {
    if (!activeDrag) return { x: null, y: null };
    const currentDragCfg = hudConfig[activeDrag as keyof HUDConfig];
    if (!currentDragCfg) return { x: null, y: null };

    let snapX: number | null = null;
    let snapY: number | null = null;

    if (Math.abs(currentDragCfg.x - 50) <= 1.5) {
      snapX = 50;
    }
    if (Math.abs(currentDragCfg.y - 50) <= 1.5) {
      snapY = 50;
    }

    const defaultConfig = isMobile 
      ? DEFAULT_MOBILE_HUD_CONFIG 
      : isUnder1280 
        ? DEFAULT_TABLET_HUD_CONFIG 
        : DEFAULT_HUD_CONFIG;
    for (const key of Object.keys(hudConfig)) {
      if (key === activeDrag) continue;
      const cfg = hudConfig[key as keyof HUDConfig] || defaultConfig[key as keyof HUDConfig];
      if (!cfg.visible) continue;

      if (Math.abs(currentDragCfg.x - cfg.x) <= 1.5) {
        snapX = cfg.x;
      }
      if (Math.abs(currentDragCfg.y - cfg.y) <= 1.5) {
        snapY = cfg.y;
      }
    }

    return { x: snapX, y: snapY };
  }, [activeDrag, hudConfig, isMobile]);

  const isCustomizing = Object.keys(hudConfig).some(key => unlockedWidgets[key]);

  const prevCategoryRef = useRef<"mobile" | "tablet" | "desktop" | null>(null);

  // Track responsive screen width & swap HUD config keys if screen type changes
  useEffect(() => {
    const check = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      const tablet = width >= 768 && width < 1280;
      setIsMobile(mobile);
      setIsUnder1280(width < 1280);

      const category = mobile ? "mobile" : tablet ? "tablet" : "desktop";

      if (prevCategoryRef.current !== category) {
        prevCategoryRef.current = category;
        const configKey = category === "mobile" 
          ? "bubu_mobile_hud_config" 
          : category === "tablet" 
            ? "bubu_tablet_hud_config" 
            : "bubu_hud_config";
        const defaultConfig = category === "mobile" 
          ? DEFAULT_MOBILE_HUD_CONFIG 
          : category === "tablet" 
            ? DEFAULT_TABLET_HUD_CONFIG 
            : DEFAULT_HUD_CONFIG;
            
        const savedHUDConfig = localStorage.getItem(configKey);
        if (savedHUDConfig !== null) {
          try {
            setHudConfig({ ...defaultConfig, ...JSON.parse(savedHUDConfig) });
          } catch {
            setHudConfig(defaultConfig);
          }
        } else {
          setHudConfig(defaultConfig);
        }
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Sync state scrolling (Smart Auto-Scroll)
  useEffect(() => {
    const anchor = chatEndRef.current;
    if (!anchor) return;
    const container = anchor.parentElement;
    if (!container) return;

    const lastMessage = chatHistory[chatHistory.length - 1];
    const lastIsUser = lastMessage?.role === "user";

    // Distance from the bottom of the message container
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;

    // Only scroll down if user sent a message, or is already near the bottom of the chat
    if (lastIsUser || distanceFromBottom < 180) {
      anchor.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, isTyping]);

  // Load chat session history from storage
  useEffect(() => {
    const savedChats = localStorage.getItem("bubu_chats");
    const savedChatId = localStorage.getItem("bubu_current_chat");
    const savedGlobalMemory = localStorage.getItem("bubu_global_memory");

    if (savedChats) {
      try {
        const parsedChats: Chat[] = JSON.parse(savedChats);
        setChats(parsedChats);

        if (savedChatId) {
          setCurrentChatId(savedChatId);
        } else if (parsedChats.length > 0) {
          setCurrentChatId(parsedChats[0].id);
        }
      } catch (e) {
        console.error("Failed to load chats from storage");
      }
    }

    if (savedGlobalMemory) {
      try {
        setGlobalMemory(JSON.parse(savedGlobalMemory));
      } catch (e) {
        console.error("Failed to load global memory from storage");
      }
    }
  }, []);

  // Save chat session history
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem("bubu_chats", JSON.stringify(chats));
      localStorage.setItem("bubu_current_chat", currentChatId ?? "");
    }
  }, [chats, currentChatId]);

  // Sync active personality when changing active chat
  useEffect(() => {
    if (currentChat) {
      setPersonality(currentChat.personality || "normal");
    }
  }, [currentChatId, chats]);

  // Change personality for active chat session
  const handleSetPersonality = (p: Personality) => {
    setPersonality(p);
    if (currentChatId) {
      setChats((prev) =>
        prev.map((c) => (c.id === currentChatId ? { ...c, personality: p } : c))
      );
    }
  };

  // Command Intent Handler
  const handleCommand = (cmd: any) => {
    const query = cmd.query || "";
    switch (cmd.target) {
      case "youtube":
        if (query) {
          window.open(
            `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
            "_blank"
          );
        } else {
          window.open("https://www.youtube.com", "_blank");
        }
        break;

      case "spotify":
        if (query) {
          window.open(
            `https://open.spotify.com/search/${encodeURIComponent(query)}`,
            "_blank"
          );
        } else {
          window.open("https://open.spotify.com", "_blank");
        }
        break;

      case "google":
        if (query) {
          window.open(
            `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            "_blank"
          );
        } else {
          window.open("https://www.google.com", "_blank");
        }
        break;

      case "instagram":
        window.open("https://www.instagram.com", "_blank");
        break;

      case "facebook":
        window.open("https://www.facebook.com", "_blank");
        break;

      case "github":
        window.open("https://www.github.com", "_blank");
        break;

      case "website":
        if (query) {
          const url = query.startsWith("http") ? query : `https://${query}`;
          window.open(url, "_blank");
        }
        break;
    }
  };


  // Manage Speak (TTS)
  const speak = async (text: string) => {
    if (recognitionRef.current && isListeningRef.current) {
      recognitionRef.current.stop();
      isListeningRef.current = false;
    }

    const cleanText = stripEmojis(text);
    if (!cleanText) return;

    try {
      setState("speaking");

      // Select voice based on personality
      let voiceName = "en-US-AriaNeural"; // Default premium female voice
      if (personality === "romantic") voiceName = "en-US-AnaNeural";
      if (personality === "caring") voiceName = "en-US-EmmaNeural";
      if (personality === "playful") voiceName = "en-US-AriaNeural";
      if (personality === "angry") voiceName = "en-US-JennyNeural";
      if (personality === "command") voiceName = "en-US-GuyNeural"; // Deep male voice for command mode

      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanText, voice: voiceName }),
      });

      if (!res.ok) throw new Error("TTS API failed");

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);

      if (!ttsAudioRef.current) {
        ttsAudioRef.current = new Audio();
      }

      // Stop any currently playing TTS audio
      ttsAudioRef.current.pause();
      ttsAudioRef.current.src = audioUrl;

      ttsAudioRef.current.onended = () => {
        lastSpeakingEndTimeRef.current = Date.now();
        setState("idle");
      };

      ttsAudioRef.current.onerror = () => {
        fallbackSpeak(cleanText);
      };

      await ttsAudioRef.current.play();
    } catch (err) {
      console.warn("Premium TTS failed, falling back to local speech synthesis", err);
      fallbackSpeak(cleanText);
    }
  };

  const fallbackSpeak = async (cleanText: string) => {
    if (!window.speechSynthesis) {
      setState("idle");
      return;
    }

    const loadVoices = (): Promise<SpeechSynthesisVoice[]> => {
      return new Promise((resolve) => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length) {
          resolve(voices);
        } else {
          window.speechSynthesis.onvoiceschanged = () => {
            resolve(window.speechSynthesis.getVoices());
          };
        }
      });
    };

    try {
      const voices = await loadVoices();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "en-IN";

      const heera = voices.find(
        (v) => v.name === "Microsoft Heera - English (India)"
      );

      if (heera) {
        utterance.voice = heera;
      } else {
        const indian = voices.find((v) => v.lang === "en-IN");
        if (indian) utterance.voice = indian;
      }

      const { pitch, rate } = getSpeechParameters(cleanText, personality);
      utterance.pitch = pitch;
      utterance.rate = rate;

      utterance.onstart = () => setState("speaking");
      utterance.onend = () => {
        lastSpeakingEndTimeRef.current = Date.now();
        setState("idle");
      };
      utterance.onerror = () => {
        lastSpeakingEndTimeRef.current = Date.now();
        setState("idle");
      };

      window.speechSynthesis.cancel();
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 100);
    } catch (e) {
      setState("idle");
    }
  };

  // Type AIMessage & trigger TTS
  const typeAIMessage = (fullText: string) => {
    let index = 0;
    speak(fullText);
    setSubtitle(fullText);

    setChats((prev) =>
      prev.map((c) =>
        c.id === currentChatId
          ? { ...c, messages: [...c.messages, { role: "ai", text: "", personality }] }
          : c
      )
    );

    const interval = setInterval(() => {
      index++;
      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== currentChatId) return c;
          const updated = [...c.messages];
          updated[updated.length - 1].text = fullText.slice(0, index);
          return { ...c, messages: updated };
        })
      );
      if (index >= fullText.length) clearInterval(interval);
    }, 25);
  };

  const parseReplyAndSentiment = (replyText: string) => {
    let rawReply = replyText || "";
    let sentimentShift = 0;
    
    // Extract sentiment score if present in any format
    const sentimentMatch = rawReply.match(/<sentiment>\s*([\+\-]?\d+)\s*<\/sentiment>/i) || 
                           rawReply.match(/([\+\-]?\d+)\s*<\/sentiment>/i);
    if (sentimentMatch) {
      sentimentShift = parseInt(sentimentMatch[1], 10);
    }

    // Clean up all tags, stray tags, and trailing numbers before the tags
    rawReply = rawReply
      .replace(/<sentiment>[\+\-]?\d+<\/sentiment>/gi, "")
      .replace(/[\+\-]?\d+\s*<\/sentiment>/gi, "")
      .replace(/<\/sentiment>/gi, "")
      .replace(/<sentiment>/gi, "")
      .trim();

    return { cleanReply: rawReply, sentimentShift };
  };

  // Fetch AI Response completions
  const getAIResponse = async (userText: string, memory?: Record<string, string>) => {

    try {
      setState("thinking");
      if (!currentChat) return;

      const getPersonalityContext = () => {
        const msgs = currentChat.messages;
        switch (personality) {
          case "romantic":
            return msgs.slice(-10);
          case "caring":
            return msgs.filter((m) => m.role === "user").slice(-6);
          case "playful":
            return msgs.slice(-4);
          case "angry":
            return msgs.slice(-2);
          case "command":
            return msgs.slice(-6);
          default:
            return msgs.slice(-6);
        }
      };

      const context = getPersonalityContext().map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          context,
          personality,
          uid: user?.uid,
          memory,
          affectionScore, // Pass affectionScore to API
        }),
      });

      const data = await res.json();

      if (data?.action === "open") {
        const speakText = data.speak || "Opening website...";
        typeAIMessage(speakText);
        handleCommand(data);
        return;
      }

      if (data?.action === "widget_update") {
        const type = data.type;
        const taskData = data.data;


        if (type === "todo_add" && taskData) {
          setTodos((prev) => {
            const item = { id: crypto.randomUUID(), text: taskData, completed: false };
            const updated = [...prev, item];
            localStorage.setItem("bubu_widget_todo", JSON.stringify(updated));
            return updated;
          });
        } else if (type === "todo_complete" && taskData) {
          setTodos((prev) => {
            const updated = prev.map((t) =>
              t.text.toLowerCase().includes(taskData.toLowerCase())
                ? { ...t, completed: true }
                : t
            );
            localStorage.setItem("bubu_widget_todo", JSON.stringify(updated));
            return updated;
          });
        } else if (type === "todo_remove" && taskData) {
          setTodos((prev) => {
            const updated = prev.filter((t) => !t.text.toLowerCase().includes(taskData.toLowerCase()));
            localStorage.setItem("bubu_widget_todo", JSON.stringify(updated));
            return updated;
          });
        } else if (type === "note_update" && taskData) {
          setNotes((prev) => {
            const updated = prev ? `${prev}\n${taskData}` : taskData;
            localStorage.setItem("bubu_widget_notes", updated);
            return updated;
          });
        }

        const { cleanReply, sentimentShift } = parseReplyAndSentiment(data.reply);
        updateAffection(sentimentShift);
        typeAIMessage(cleanReply);
        return;
      }

      if (data?.reply) {
        const { cleanReply, sentimentShift } = parseReplyAndSentiment(data.reply);
        updateAffection(sentimentShift);
        typeAIMessage(cleanReply);
        return;
      }

      setState("idle");
    } catch {
      speak("Sorry, I am having trouble thinking.");
      setState("idle");
    }
  };

  // Send input text message
  const handleSendText = async () => {
    if (!inputText.trim()) return;
    if (!currentChatId) createNewChat();

    const text = inputText.trim();
    const detected = detectMemory(text);
    setInputText("");

    const updatedGlobal = { ...globalMemory, ...detected };
    if (Object.keys(detected).length > 0) {
      setGlobalMemory(updatedGlobal);
      localStorage.setItem("bubu_global_memory", JSON.stringify(updatedGlobal));
    }

    const accumulatedMemory = {
      ...(currentChat?.memory || {}),
      ...updatedGlobal,
    };

    setChats((prev) =>
      prev.map((c) =>
        c.id === currentChatId
          ? {
              ...c,
              messages: [...c.messages, { role: "user", text, personality }],
              title: c.messages.length === 0 ? text.slice(0, 20) : c.title,
              memory: { ...(c.memory || {}), ...detected },
            }
          : c
      )
    );

    getAIResponse(text, accumulatedMemory);
  };

  // Configure Speech Recognition
  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = "en-IN";
    recognition.continuous = false;

    recognition.onstart = () => {
      isListeningRef.current = true;
      setState("listening");
    };

    recognition.onresult = (e: any) => {
      // Prevent feedback loops: Ignore mic inputs if Bubu is speaking or just finished speaking
      const isSpeakingActive = (ttsAudioRef.current && !ttsAudioRef.current.paused) || (window.speechSynthesis && window.speechSynthesis.speaking);
      if (isSpeakingActive) {
        console.log("Ignored mic input: Bubu is speaking.");
        return;
      }
      const silenceBuffer = 1200; // 1.2s buffer
      if (Date.now() - lastSpeakingEndTimeRef.current < silenceBuffer) {
        console.log("Ignored mic input: Buffer active after speaking.");
        return;
      }

      const text = e.results?.[0]?.[0]?.transcript?.trim();
      if (!text || !currentChatId) return;

      const detected = detectMemory(text);
      const updatedGlobal = { ...globalMemoryRef.current, ...detected };

      if (Object.keys(detected).length > 0) {
        setGlobalMemory(updatedGlobal);
        localStorage.setItem("bubu_global_memory", JSON.stringify(updatedGlobal));
      }

      const accumulated = {
        ...currentChatMemoryRef.current,
        ...updatedGlobal,
      };

      setChats((prev) =>
        prev.map((c) =>
          c.id === currentChatId
            ? {
                ...c,
                messages: [...c.messages, { role: "user", text, personality }],
                title: c.messages.length === 0 ? text.slice(0, 20) : c.title,
                memory: { ...(c.memory || {}), ...detected },
              }
            : c
        )
      );

      getAIResponse(text, accumulated);
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      if (state !== "speaking") setState("idle");
    };

    recognitionRef.current = recognition;
  }, [state, currentChatId, personality, globalMemory]);

  const startListening = () => {
    if (!recognitionRef.current || isListeningRef.current) return;
    if (!currentChatId) createNewChat();
    recognitionRef.current.start();
  };

  // Continuous hands-free loop for calling mode
  useEffect(() => {
    if (voiceMode && state === "idle" && !isMuted) {
      const delay = setTimeout(() => {
        if (!isListeningRef.current) {
          // Double check to verify speech synthesis is not active
          const isSpeakingActive = (ttsAudioRef.current && !ttsAudioRef.current.paused) || (window.speechSynthesis && window.speechSynthesis.speaking);
          if (!isSpeakingActive) {
            startListening();
          }
        }
      }, 1000); // 1 second buffer to prevent trailing echo pickup
      return () => clearTimeout(delay);
    }
  }, [voiceMode, state, isMuted]);

  // Handle Call Connection initial greeting
  const handleCallConnect = () => {
    playConnectionSound(true);
    const greetingPrompt = `(Call connected. Greet the user in 1 very short sentence in your personality style. Talk directly, no system indicators. Reply in casual English only.)`;
    getAIResponse(greetingPrompt, currentChatMemoryRef.current);
  };

  const handleEndCall = () => {
    playConnectionSound(false);
    setVoiceMode(false);
    setIsMuted(false);
    if (recognitionRef.current && isListeningRef.current) {
      recognitionRef.current.stop();
      isListeningRef.current = false;
    }
    window.speechSynthesis.cancel();
    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
    }
    setState("idle");
  };

  const handleInterrupt = () => {
    if (state === "speaking") {
      window.speechSynthesis.cancel();
      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause();
      }
      setState("idle");
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      isListeningRef.current = false;
      setTimeout(() => {
        startListening();
      }, 100);
    }
  };

  // Create new session
  const createNewChat = () => {
    const id = crypto.randomUUID();
    const newChat: Chat = {
      id,
      title: "New Chat",
      messages: [],
      createdAt: Date.now(),
      personality: personality,
    };
    setChats((prev) => [newChat, ...prev]);
    setCurrentChatId(id);
    setState("idle");
  };

  // Delete chat session
  const deleteChat = (id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (currentChatId === id) {
      setCurrentChatId(null);
    }
  };

  // Save renamed session title
  const saveChatTitle = (id: string) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, title: editTitle || c.title } : c
      )
    );
    setEditingChatId(null);
  };

  const chatWidthMap = {
    compact: "w-full lg:w-[380px] flex-1 lg:flex-none lg:h-full rounded-3xl max-w-[420px] lg:max-w-none self-center lg:self-auto",
    medium: "w-full lg:w-[480px] flex-1 lg:flex-none lg:h-full rounded-3xl max-w-[520px] lg:max-w-none self-center lg:self-auto",
    wide: "w-full lg:w-[600px] flex-1 lg:flex-none lg:h-full rounded-3xl max-w-[640px] lg:max-w-none self-center lg:self-auto",
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#020617] flex flex-col items-center justify-center gap-6 select-none overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#0f172a_0%,#020617_70%)] pointer-events-none z-0" />
        <div className="relative w-48 h-48 z-10 flex items-center justify-center">
          <NeuralOrb state="thinking" energy={0.5} personality="normal" />
        </div>
        <div className="z-10 flex flex-col items-center gap-2">
          <span className="text-sm font-bold tracking-widest text-cyan-400 uppercase animate-pulse">Initializing BUBU AI</span>
          <span className="text-xs text-white/40">Securing environment...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <div
      className={`flex flex-col h-dvh transition-colors duration-500 overflow-hidden relative ${
        isDark ? "bg-[#020617] text-white" : "bg-[#f8fafc] text-gray-900"
      }`}
    >
      {/* 🎨 DYNAMIC UI STYLING OVERRIDES */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --font-custom: "Outfit", system-ui, sans-serif;
          --accent-rgb: ${personalityRGB[personality] || "34, 211, 238"};
          --glass-bg: rgba(10, 15, 30, 0.7);
          --glass-blur: 16px;
          --glass-border: rgba(${personalityRGB[personality] || "34, 211, 238"}, 0.12);
          --canvas-glow: drop-shadow(0 0 24px rgba(${personalityRGB[personality] || "34, 211, 238"}, 0.25));
          --accent-glow: rgba(${personalityRGB[personality] || "34, 211, 238"}, 0.3);
        }

        .custom-glass-panel {
          background: rgba(10, 15, 30, 0.72) !important;
          backdrop-filter: blur(16px) !important;
          border: 1px solid rgba(${personalityRGB[personality] || "34, 211, 238"}, 0.15) !important;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.45), 
                      inset 0 1px 0 0 rgba(255, 255, 255, 0.08),
                      inset 0 0 12px 0 rgba(${personalityRGB[personality] || "34, 211, 238"}, 0.03) !important;
          transition: border-color 0.5s ease, box-shadow 0.5s ease;
        }
      `}} />

      {/* 🌌 IMMERSIVE DYNAMIC AURORA GRID BACKGROUND */}
      <DynamicBackground isDark={isDark} personality={personality} state={state} />

      {/* 🎧 VOICE MODE OVERLAY */}
      {voiceMode && (
        <VoiceMode
          state={state}
          energy={energyLevel}
          subtitle={subtitle}
          personality={personality}
          onMicClick={startListening}
          onExit={handleEndCall}
          isMuted={isMuted}
          onMuteToggle={() => setIsMuted(!isMuted)}
          onCallConnect={handleCallConnect}
          isIncomingCall={isIncomingCall}
          onInterrupt={handleInterrupt}
        />
      )}

      {/* 🌐 GLOBAL DASHBOARD HEADER */}
      {hudConfig.header.visible && (
        <div
          onMouseDown={(e) => startLongPress(e, "header")}
          onTouchStart={(e) => startLongPress(e, "header")}
          onMouseMove={moveLongPress}
          onTouchMove={moveLongPress}
          onMouseUp={endLongPress}
          onTouchEnd={endLongPress}
          onContextMenu={(e) => handleContextMenu(e, "header")}
          onDoubleClick={(e) => handleWidgetDoubleClick(e, "header")}
          style={{
            position: "absolute",
            left: `${hudConfig.header.x}%`,
            top: `${hudConfig.header.y}%`,
            width: `${hudConfig.header.w}%`,
            height: `${hudConfig.header.h}%`,
            transform: `scale(${hudConfig.header.scale})`,
            transformOrigin: "top left",
            opacity: hudConfig.header.opacity,
            zIndex: 30,
            pointerEvents: unlockedWidgets.header ? "none" : "auto",
            transition: "transform 0.15s ease-out, opacity 0.15s ease-out, border-color 0.3s ease",
          }}
        >
          <Header
            isMobile={isMobile}
            setMobileSidebarOpen={setMobileSidebarOpen}
            personality={personality}
            isDark={isDark}
            ambientPlayerOpen={ambientPlayerOpen}
            setAmbientPlayerOpen={handleToggleAmbientPlayer}
            affectionScore={affectionScore}
            className="w-full h-full rounded-2xl border shadow-lg"
          />
        </div>
      )}

      {/* 🚀 MAIN CONTENT BODY */}
      <main 
        onDoubleClick={handleBackgroundDoubleClick}
        onContextMenu={handleBackgroundContextMenu}
        onTouchStart={handleBackgroundTouchStart}
        onTouchMove={handleBackgroundTouchMove}
        onTouchEnd={handleBackgroundTouchEnd}
        className="flex-1 relative overflow-hidden select-none"
      >
        {/* Holographic grid guide overlay when customizing */}
        {isCustomizing && (
          <div className="absolute inset-0 z-0 pointer-events-none opacity-30 bg-[linear-gradient(to_right,rgba(34,211,238,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,211,238,0.06)_1px,transparent_1px)] bg-[size:4%_4%]" />
        )}

        {/* Holographic Snap Lines */}
        {snapLines.x !== null && (
          <div 
            className="absolute top-0 bottom-0 border-l border-dashed border-cyan-400/60 z-[9980] pointer-events-none shadow-[0_0_8px_rgba(34,211,238,0.4)]"
            style={{ left: `${snapLines.x}%` }}
          />
        )}
        {snapLines.y !== null && (
          <div 
            className="absolute left-0 right-0 border-t border-dashed border-cyan-400/60 z-[9980] pointer-events-none shadow-[0_0_8px_rgba(34,211,238,0.4)]"
            style={{ top: `${snapLines.y}%` }}
          />
        )}
        
        {/* 🧾 RESPONSIVE SIDEBAR COMPONENT (Globally handled drawer for mobile) */}
        {isMobile && (
          <Sidebar
            isMobile={true}
            mobileSidebarOpen={mobileSidebarOpen}
            setMobileSidebarOpen={setMobileSidebarOpen}
            isDark={isDark}
            personality={personality}
            setPersonality={handleSetPersonality}
            chats={chats}
            currentChatId={currentChatId}
            setCurrentChatId={setCurrentChatId}
            createNewChat={createNewChat}
            setVoiceMode={triggerVoiceMode}
            deleteChat={deleteChat}
            editingChatId={editingChatId}
            setEditingChatId={setEditingChatId}
            editTitle={editTitle}
            setEditTitle={setEditTitle}
            saveChatTitle={saveChatTitle}
            onOpenMemory={() => handleToggleMemoryVault(true)}
            affectionScore={affectionScore}
          />
        )}

        {/* Unified Floating HUD Component Layout */}
        <>
          {/* 🧾 SIDEBAR WIDGET */}
          {hudConfig.sidebar.visible && (
            <div
              onMouseDown={(e) => startLongPress(e, "sidebar")}
              onTouchStart={(e) => startLongPress(e, "sidebar")}
              onMouseMove={moveLongPress}
              onTouchMove={moveLongPress}
              onMouseUp={endLongPress}
              onTouchEnd={endLongPress}
              onContextMenu={(e) => handleContextMenu(e, "sidebar")}
              onDoubleClick={(e) => handleWidgetDoubleClick(e, "sidebar")}
              style={{
                position: "absolute",
                left: `${hudConfig.sidebar.x}%`,
                top: `${hudConfig.sidebar.y}%`,
                width: `${hudConfig.sidebar.w}%`,
                height: `${hudConfig.sidebar.h}%`,
                transform: `scale(${hudConfig.sidebar.scale})`,
                transformOrigin: "top left",
                opacity: hudConfig.sidebar.opacity,
                zIndex: 20,
                pointerEvents: unlockedWidgets.sidebar ? "none" : "auto",
                transition: "transform 0.15s ease-out, opacity 0.15s ease-out, border-color 0.3s ease",
              }}
            >
              <Sidebar
                isMobile={false}
                mobileSidebarOpen={mobileSidebarOpen}
                setMobileSidebarOpen={setMobileSidebarOpen}
                isDark={isDark}
                personality={personality}
                setPersonality={handleSetPersonality}
                chats={chats}
                currentChatId={currentChatId}
                setCurrentChatId={setCurrentChatId}
                createNewChat={createNewChat}
                setVoiceMode={triggerVoiceMode}
                deleteChat={deleteChat}
                editingChatId={editingChatId}
                setEditingChatId={setEditingChatId}
                editTitle={editTitle}
                setEditTitle={setEditTitle}
                saveChatTitle={saveChatTitle}
                onOpenMemory={() => handleToggleMemoryVault(true)}
                affectionScore={affectionScore}
                className="w-full h-full rounded-3xl border shadow-lg"
              />
            </div>
          )}

          {/* 💬 CHAT PANEL WIDGET */}
          {hudConfig.chat.visible && !voiceMode && (
            <div
              onMouseDown={(e) => startLongPress(e, "chat")}
              onTouchStart={(e) => startLongPress(e, "chat")}
              onMouseMove={moveLongPress}
              onTouchMove={moveLongPress}
              onMouseUp={endLongPress}
              onTouchEnd={endLongPress}
              onContextMenu={(e) => handleContextMenu(e, "chat")}
              onDoubleClick={(e) => handleWidgetDoubleClick(e, "chat")}
              style={{
                position: "absolute",
                left: `${hudConfig.chat.x}%`,
                top: `${hudConfig.chat.y}%`,
                width: `${hudConfig.chat.w}%`,
                height: `${hudConfig.chat.h}%`,
                transform: `scale(${hudConfig.chat.scale})`,
                transformOrigin: "top left",
                opacity: hudConfig.chat.opacity,
                zIndex: 20,
                pointerEvents: unlockedWidgets.chat ? "none" : "auto",
                transition: "transform 0.15s ease-out, opacity 0.15s ease-out, border-color 0.3s ease",
              }}
            >
              <ChatPanel
                isMobile={false}
                isDark={isDark}
                ytVideoQuery={ytVideoQuery}
                setYtVideoQuery={setYtVideoQuery}
                chatHistory={chatHistory}
                themeStyles={themeStyles}
                isTyping={isTyping}
                inputText={inputText}
                setInputText={setInputText}
                handleSendText={handleSendText}
                startListening={startListening}
                chatEndRef={chatEndRef}
                personality={personality}
                voiceMode={voiceMode}
                setVoiceMode={triggerVoiceMode}
                ambientPlayerOpen={ambientPlayerOpen}
                setAmbientPlayerOpen={handleToggleAmbientPlayer}
                className="w-full h-full rounded-3xl border shadow-lg"
              />
            </div>
          )}

          {/* 🪐 AIVATAR VISUALIZER */}
          {hudConfig.visualizer.visible && !voiceMode && (
            <div
              onMouseDown={(e) => startLongPress(e, "visualizer")}
              onTouchStart={(e) => startLongPress(e, "visualizer")}
              onMouseMove={moveLongPress}
              onTouchMove={moveLongPress}
              onMouseUp={endLongPress}
              onTouchEnd={endLongPress}
              onContextMenu={(e) => handleContextMenu(e, "visualizer")}
              onDoubleClick={(e) => handleWidgetDoubleClick(e, "visualizer")}
              style={{
                position: "absolute",
                left: `${hudConfig.visualizer.x}%`,
                top: `${hudConfig.visualizer.y}%`,
                width: `${hudConfig.visualizer.w}%`,
                height: `${hudConfig.visualizer.h}%`,
                transform: `scale(${hudConfig.visualizer.scale})`,
                transformOrigin: "top left",
                opacity: hudConfig.visualizer.opacity,
                zIndex: 10,
                pointerEvents: unlockedWidgets.visualizer ? "none" : "auto",
                transition: "transform 0.15s ease-out, opacity 0.15s ease-out, border-color 0.3s ease",
              }}
            >
              <DesktopVisualizer
                state={state}
                energyLevel={energyLevel}
                personality={personality}
                setPersonality={handleSetPersonality}
                glowLevel="soft"
                avatarSize="medium"
                className="w-full h-full rounded-3xl border border-white/5 custom-glass-panel shadow-lg"
              />
            </div>
          )}

          {/* Interactive Workspace Panel (HUD-based) */}
          {!voiceMode && widgetPanelOpen && hudConfig.todo.visible && (
            <div
              onMouseDown={(e) => startLongPress(e, "todo")}
              onTouchStart={(e) => startLongPress(e, "todo")}
              onMouseMove={moveLongPress}
              onTouchMove={moveLongPress}
              onMouseUp={endLongPress}
              onTouchEnd={endLongPress}
              onContextMenu={(e) => handleContextMenu(e, "todo")}
              onDoubleClick={(e) => handleWidgetDoubleClick(e, "todo")}
              style={{
                position: "absolute",
                left: `${hudConfig.todo.x}%`,
                top: `${hudConfig.todo.y}%`,
                width: `${hudConfig.todo.w}%`,
                height: `${hudConfig.todo.h}%`,
                transform: `scale(${hudConfig.todo.scale})`,
                transformOrigin: "top left",
                opacity: hudConfig.todo.opacity,
                zIndex: 25,
                pointerEvents: unlockedWidgets.todo ? "none" : "auto",
                transition: "transform 0.15s ease-out, opacity 0.15s ease-out, border-color 0.3s ease",
              }}
            >
              <WidgetPanel
                isMobile={isMobile}
                isOpen={widgetPanelOpen}
                onClose={() => setWidgetPanelOpen(false)}
                todos={todos}
                setTodos={setTodos}
                notes={notes}
                setNotes={setNotes}
                className="w-full h-full"
              />
            </div>
          )}

          {/* Ambient Player (HUD-based) */}
          {!voiceMode && ambientPlayerOpen && hudConfig.songs.visible && (
            <div
              onMouseDown={(e) => startLongPress(e, "songs")}
              onTouchStart={(e) => startLongPress(e, "songs")}
              onMouseMove={moveLongPress}
              onTouchMove={moveLongPress}
              onMouseUp={endLongPress}
              onTouchEnd={endLongPress}
              onContextMenu={(e) => handleContextMenu(e, "songs")}
              onDoubleClick={(e) => handleWidgetDoubleClick(e, "songs")}
              style={{
                position: "absolute",
                left: `${hudConfig.songs.x}%`,
                top: `${hudConfig.songs.y}%`,
                width: `${hudConfig.songs.w}%`,
                height: `${hudConfig.songs.h}%`,
                transform: `scale(${hudConfig.songs.scale})`,
                transformOrigin: "top left",
                opacity: hudConfig.songs.opacity,
                zIndex: 30,
                pointerEvents: unlockedWidgets.songs ? "none" : "auto",
                transition: "transform 0.15s ease-out, opacity 0.15s ease-out, border-color 0.3s ease",
              }}
            >
              <AmbientPlayer
                isOpen={ambientPlayerOpen}
                onClose={() => setAmbientPlayerOpen(false)}
                className="w-full h-full"
              />
            </div>
          )}

          {/* Memory Vault (HUD-based) */}
          {!voiceMode && memoryVaultOpen && hudConfig.memory.visible && (
            <div
              onMouseDown={(e) => startLongPress(e, "memory")}
              onTouchStart={(e) => startLongPress(e, "memory")}
              onMouseMove={moveLongPress}
              onTouchMove={moveLongPress}
              onMouseUp={endLongPress}
              onTouchEnd={endLongPress}
              onContextMenu={(e) => handleContextMenu(e, "memory")}
              onDoubleClick={(e) => handleWidgetDoubleClick(e, "memory")}
              style={{
                position: "absolute",
                left: `${hudConfig.memory.x}%`,
                top: `${hudConfig.memory.y}%`,
                width: `${hudConfig.memory.w}%`,
                height: `${hudConfig.memory.h}%`,
                transform: `scale(${hudConfig.memory.scale})`,
                transformOrigin: "top left",
                opacity: hudConfig.memory.opacity,
                zIndex: 35,
                pointerEvents: unlockedWidgets.memory ? "none" : "auto",
                transition: "transform 0.15s ease-out, opacity 0.15s ease-out, border-color 0.3s ease",
              }}
            >
              <MemoryVault
                isOpen={memoryVaultOpen}
                onClose={() => setMemoryVaultOpen(false)}
                memory={globalMemory}
                onSaveMemory={(updated) => {
                  setGlobalMemory(updated);
                  localStorage.setItem("bubu_global_memory", JSON.stringify(updated));
                }}
                className="w-full h-full"
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          )}

          {/* Floating Quick Action Toggles */}
          {!voiceMode && (
            <>
              {hudConfig.todoToggle.visible && (
                <button
                  onClick={(e) => {
                    if (longPressActiveRef.current) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    handleToggleWidgetPanel(!widgetPanelOpen);
                  }}
                  onMouseDown={(e) => startLongPress(e, "todoToggle")}
                  onTouchStart={(e) => startLongPress(e, "todoToggle")}
                  onMouseMove={moveLongPress}
                  onTouchMove={moveLongPress}
                  onMouseUp={endLongPress}
                  onTouchEnd={endLongPress}
                  onContextMenu={(e) => handleContextMenu(e, "todoToggle")}
                  className={`flex items-center justify-center rounded-full border transition-all active:scale-95 shadow-lg backdrop-blur-md cursor-pointer select-none
                    ${widgetPanelOpen 
                      ? "bg-cyan-500/20 border-cyan-500/35 text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.3)]" 
                      : "bg-[#090d16]/80 border-white/10 text-white hover:bg-white/10 hover:border-white/20"
                    }`}
                  style={{
                    position: "absolute",
                    left: `${hudConfig.todoToggle.x}%`,
                    top: `${hudConfig.todoToggle.y}%`,
                    width: "48px",
                    height: "48px",
                    fontSize: "1.25rem",
                    transform: `scale(${hudConfig.todoToggle.scale})`,
                    transformOrigin: "center center",
                    opacity: hudConfig.todoToggle.opacity,
                    zIndex: 40,
                    pointerEvents: unlockedWidgets.todoToggle ? "none" : "auto",
                    transition: "transform 0.15s ease-out, opacity 0.15s ease-out, border-color 0.3s ease",
                  }}
                  title="Workspace Planner (Todo & Notes)"
                >
                  📋
                </button>
              )}

              {hudConfig.songsToggle.visible && (
                <button
                  onClick={(e) => {
                    if (longPressActiveRef.current) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    handleToggleAmbientPlayer(!ambientPlayerOpen);
                  }}
                  onMouseDown={(e) => startLongPress(e, "songsToggle")}
                  onTouchStart={(e) => startLongPress(e, "songsToggle")}
                  onMouseMove={moveLongPress}
                  onTouchMove={moveLongPress}
                  onMouseUp={endLongPress}
                  onTouchEnd={endLongPress}
                  onContextMenu={(e) => handleContextMenu(e, "songsToggle")}
                  className={`flex items-center justify-center rounded-full border transition-all active:scale-95 shadow-lg backdrop-blur-md cursor-pointer select-none
                    ${ambientPlayerOpen 
                      ? "bg-cyan-500/20 border-cyan-500/35 text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.3)]" 
                      : "bg-[#090d16]/80 border-white/10 text-white hover:bg-white/10 hover:border-white/20"
                    }`}
                  style={{
                    position: "absolute",
                    left: `${hudConfig.songsToggle.x}%`,
                    top: `${hudConfig.songsToggle.y}%`,
                    width: "48px",
                    height: "48px",
                    fontSize: "1.25rem",
                    transform: `scale(${hudConfig.songsToggle.scale})`,
                    transformOrigin: "center center",
                    opacity: hudConfig.songsToggle.opacity,
                    zIndex: 40,
                    pointerEvents: unlockedWidgets.songsToggle ? "none" : "auto",
                    transition: "transform 0.15s ease-out, opacity 0.15s ease-out, border-color 0.3s ease",
                  }}
                  title="Ambient Music Player"
                >
                  🎧
                </button>
              )}

              {hudConfig.memoryToggle.visible && (
                <button
                  onClick={(e) => {
                    if (longPressActiveRef.current) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    handleToggleMemoryVault(!memoryVaultOpen);
                  }}
                  onMouseDown={(e) => startLongPress(e, "memoryToggle")}
                  onTouchStart={(e) => startLongPress(e, "memoryToggle")}
                  onMouseMove={moveLongPress}
                  onTouchMove={moveLongPress}
                  onMouseUp={endLongPress}
                  onTouchEnd={endLongPress}
                  onContextMenu={(e) => handleContextMenu(e, "memoryToggle")}
                  className={`flex items-center justify-center rounded-full border transition-all active:scale-95 shadow-lg backdrop-blur-md cursor-pointer select-none
                    ${memoryVaultOpen 
                      ? "bg-cyan-500/20 border-cyan-500/35 text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.3)]" 
                      : "bg-[#090d16]/80 border-white/10 text-white hover:bg-white/10 hover:border-white/20"
                    }`}
                  style={{
                    position: "absolute",
                    left: `${hudConfig.memoryToggle.x}%`,
                    top: `${hudConfig.memoryToggle.y}%`,
                    width: "48px",
                    height: "48px",
                    fontSize: "1.25rem",
                    transform: `scale(${hudConfig.memoryToggle.scale})`,
                    transformOrigin: "center center",
                    opacity: hudConfig.memoryToggle.opacity,
                    zIndex: 40,
                    pointerEvents: unlockedWidgets.memoryToggle ? "none" : "auto",
                    transition: "transform 0.15s ease-out, opacity 0.15s ease-out, border-color 0.3s ease",
                  }}
                  title="BUBU Memory Vault"
                >
                  🧠
                </button>
              )}
            </>
          )}
        </>

        {/* ✥ DRAG OVERLAYS (Only visible for unlocked widgets) */}
        {Object.keys(hudConfig).some(key => unlockedWidgets[key]) && (
          <div className="absolute inset-0 z-[9990] pointer-events-none">
            {(Object.keys(hudConfig) as Array<keyof HUDConfig>).map((widget) => {
              if (widget === "customizerToggle") return null;
              const defaultConfig = isMobile 
                ? DEFAULT_MOBILE_HUD_CONFIG 
                : isUnder1280 
                  ? DEFAULT_TABLET_HUD_CONFIG 
                  : DEFAULT_HUD_CONFIG;
              const cfg = hudConfig[widget] || defaultConfig[widget];
              if (!cfg.visible) return null;
              if (!unlockedWidgets[widget]) return null;

              const isDraggingThis = activeDrag === widget;
              const isButton = widget.endsWith("Toggle");
              const label = widgetLabels[widget] || widget;

              const styleProps: React.CSSProperties = isButton 
                ? {
                    position: "absolute",
                    left: `${cfg.x}%`,
                    top: `${cfg.y}%`,
                    width: "48px",
                    height: "48px",
                    transform: `scale(${cfg.scale})`,
                    transformOrigin: "center center",
                  }
                : {
                    position: "absolute",
                    left: `${cfg.x}%`,
                    top: `${cfg.y}%`,
                    width: `${cfg.w}%`,
                    height: `${cfg.h}%`,
                    transform: `scale(${cfg.scale})`,
                    transformOrigin: "top left",
                  };

              return (
                <div
                  key={widget}
                  style={{
                    ...styleProps,
                    zIndex: isDraggingThis ? 9995 : 9990,
                  }}
                  className="pointer-events-auto group"
                >
                  <div 
                    className={`w-full h-full flex flex-col justify-between cursor-grab active:cursor-grabbing transition-all select-none relative
                      ${isButton ? "rounded-full p-1" : "rounded-3xl p-4"}
                      border-2 border-dashed border-cyan-400/40 bg-cyan-950/20 hover:border-cyan-400 hover:bg-cyan-900/30 backdrop-blur-[2px]
                      ${isDraggingThis ? "opacity-90 border-solid border-cyan-400 bg-cyan-900/45 scale-[1.02] shadow-[0_0_20px_rgba(34,211,238,0.4)]" : ""}
                    `}
                    onMouseDown={(e) => startDrag(e, widget)}
                    onTouchStart={(e) => startDrag(e, widget)}
                  >
                    {/* Holographic readout when dragging */}
                    {isDraggingThis && (
                      <div className="absolute -top-8 left-0 bg-[#090d16]/95 border border-cyan-400 text-cyan-400 text-[8px] font-mono px-2 py-0.5 rounded shadow-[0_0_10px_rgba(34,211,238,0.4)] animate-pulse z-[100] whitespace-nowrap">
                        X: {cfg.x}% | Y: {cfg.y}% | S: {Math.round(cfg.scale * 100)}%
                      </div>
                    )}

                    {/* High-Tech Bracket Corners */}
                    <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400 pointer-events-none rounded-tl-[4px] opacity-75" />
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-400 pointer-events-none rounded-tr-[4px] opacity-75" />
                    <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-400 pointer-events-none rounded-bl-[4px] opacity-75" />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-400 pointer-events-none rounded-br-[4px] opacity-75" />

                    {/* Hide Component Button (Eye icon) in top right */}
                    {!isButton && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateWidgetConfig(widget, { visible: false });
                        }}
                        className="absolute top-2 right-2 p-1 rounded-md bg-black/60 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-white/70 hover:text-red-400 transition cursor-pointer z-[100]"
                        title={`Hide ${label}`}
                      >
                        👁️
                      </button>
                    )}

                    {!isButton ? (
                      <>
                        {/* Top widget tag */}
                        <div className="flex items-center justify-between pointer-events-none bg-black/60 px-2.5 py-1 rounded-lg border border-white/5 select-none">
                          <span className="text-[9px] font-bold text-cyan-400 tracking-wider uppercase truncate max-w-[120px]">
                            {label}
                          </span>
                          <span className="text-[8px] text-white/50 font-mono">
                            {cfg.x}%, {cfg.y}%
                          </span>
                        </div>

                        {/* Center Drag Icon */}
                        <div className="flex-1 flex flex-col items-center justify-center pointer-events-none text-cyan-400/60 select-none">
                          <span className="text-2xl">✥</span>
                          <span className="text-[8px] uppercase tracking-widest font-semibold mt-1">Drag to Move</span>
                        </div>

                        {/* Contextual control panel inside overlay */}
                        <div 
                          className="mt-2 bg-[#090d16]/95 border border-cyan-500/30 p-1.5 rounded-xl flex items-center justify-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto shadow-md"
                          onMouseDown={(e) => e.stopPropagation()} // Prevent drag on controls
                          onTouchStart={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              setUnlockedWidgets((prev) => ({ ...prev, [widget]: false }));
                            }}
                            className="p-1 rounded bg-cyan-500/20 hover:bg-cyan-500/40 text-[9px] font-bold text-cyan-400 cursor-pointer transition-all active:scale-95 flex items-center justify-center"
                            title="Lock Layout (🔒)"
                          >
                            🔒
                          </button>

                          <div className="w-[1px] h-3 bg-white/10" />

                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-white/50 cursor-default" title="Scale Layout">🔎</span>
                            <button
                              onClick={() => updateWidgetConfig(widget, { scale: Math.max(0.5, cfg.scale - 0.05) })}
                              className="w-4 h-4 rounded bg-white/5 border border-white/10 hover:bg-white/15 text-[10px] font-bold flex items-center justify-center text-white cursor-pointer transition-all"
                            >
                              -
                            </button>
                            <span className="text-[8px] font-mono font-bold text-cyan-400 w-7 text-center">
                              {Math.round(cfg.scale * 100)}%
                            </span>
                            <button
                              onClick={() => updateWidgetConfig(widget, { scale: Math.min(1.5, cfg.scale + 0.05) })}
                              className="w-4 h-4 rounded bg-white/5 border border-white/10 hover:bg-white/15 text-[10px] font-bold flex items-center justify-center text-white cursor-pointer transition-all"
                            >
                              +
                            </button>
                          </div>

                          <div className="w-[1px] h-3 bg-white/10" />

                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-white/50 cursor-default" title="Adjust Opacity">🌓</span>
                            <button
                              onClick={() => updateWidgetConfig(widget, { opacity: Math.max(0.1, cfg.opacity - 0.1) })}
                              className="w-4 h-4 rounded bg-white/5 border border-white/10 hover:bg-white/15 text-[10px] font-bold flex items-center justify-center text-white cursor-pointer transition-all"
                            >
                              -
                            </button>
                            <span className="text-[8px] font-mono font-bold text-cyan-400 w-7 text-center">
                              {Math.round(cfg.opacity * 100)}%
                            </span>
                            <button
                              onClick={() => updateWidgetConfig(widget, { opacity: Math.min(1.0, cfg.opacity + 0.1) })}
                              className="w-4 h-4 rounded bg-white/5 border border-white/10 hover:bg-white/15 text-[10px] font-bold flex items-center justify-center text-white cursor-pointer transition-all"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      // Button Toggle Specific mini-overlay
                      <div className="w-full h-full flex flex-col items-center justify-center relative">
                        <span className="text-sm">
                          {widget === "todoToggle" ? "📋" : widget === "songsToggle" ? "🎧" : "🧠"}
                        </span>
                        
                        {/* Hover micro controls for buttons (Hide / Scale / Lock) */}
                        <div 
                          className="absolute -bottom-7 bg-[#090d16]/95 border border-cyan-500/30 py-0.5 px-1.5 rounded-md flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-auto shadow-md"
                          onMouseDown={(e) => e.stopPropagation()} 
                          onTouchStart={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              setUnlockedWidgets((prev) => ({ ...prev, [widget]: false }));
                            }}
                            className="w-3.5 h-3.5 rounded bg-cyan-500/20 text-[7px] flex items-center justify-center text-cyan-400 hover:bg-cyan-500/35 cursor-pointer font-bold"
                            title="Lock Position"
                          >
                            🔒
                          </button>
                          <div className="w-[1px] h-2 bg-white/15" />
                          <button
                            onClick={() => updateWidgetConfig(widget, { scale: Math.max(0.6, cfg.scale - 0.1) })}
                            className="w-3.5 h-3.5 rounded bg-white/5 text-[8px] font-bold flex items-center justify-center text-white hover:bg-white/10 cursor-pointer"
                            title="Decrease Scale"
                          >
                            -
                          </button>
                          <span className="text-[7px] text-cyan-400 font-mono font-bold">
                            {Math.round(cfg.scale * 100)}%
                          </span>
                          <button
                            onClick={() => updateWidgetConfig(widget, { scale: Math.min(1.4, cfg.scale + 0.1) })}
                            className="w-3.5 h-3.5 rounded bg-white/5 text-[8px] font-bold flex items-center justify-center text-white hover:bg-white/10 cursor-pointer"
                            title="Increase Scale"
                          >
                            +
                          </button>
                          <div className="w-[1px] h-2 bg-white/15" />
                          <button
                            onClick={() => updateWidgetConfig(widget, { visible: false })}
                            className="w-3.5 h-3.5 rounded bg-red-500/20 text-[7px] flex items-center justify-center text-red-400 hover:bg-red-500/30 cursor-pointer"
                            title="Hide Button"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Context Menu for locking/unlocking/hiding widgets */}
      {contextMenu && contextMenu.widget !== ("background" as any) && (
        <div
          className="fixed z-[10000] bg-[#080d1a]/95 border border-cyan-500/30 rounded-xl p-1.5 shadow-[0_10px_30px_rgba(6,182,212,0.35)] backdrop-blur-md flex flex-col gap-1 text-xs text-white min-w-[140px]"
          style={{
            left: `${Math.max(75, Math.min(typeof window !== "undefined" ? window.innerWidth - 75 : 300, contextMenu.x))}px`,
            top: `${contextMenu.y}px`,
            transform: contextMenu.y < 150 ? "translate(-50%, 15px)" : "translate(-50%, -105%)",
          }}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="px-2.5 py-1 text-[9px] font-bold text-white/40 uppercase tracking-wider select-none border-b border-white/5 pb-1.5 mb-1">
            {widgetLabels[contextMenu.widget] || contextMenu.widget}
          </div>
          <button
            onClick={() => {
              const isCurrentlyUnlocked = unlockedWidgets[contextMenu.widget];
              setUnlockedWidgets((prev) => ({
                ...prev,
                [contextMenu.widget]: !isCurrentlyUnlocked,
              }));
              setContextMenu(null);
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-cyan-500/20 text-cyan-400 font-semibold transition cursor-pointer select-none text-left"
          >
            {unlockedWidgets[contextMenu.widget] ? "🔒 Lock Position" : "🔓 Unlock Position"}
          </button>
          {!unlockedWidgets[contextMenu.widget] && (
            <button
              onClick={() => {
                updateWidgetConfig(contextMenu.widget, { visible: false });
                setContextMenu(null);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-red-500/20 text-red-400 font-semibold transition cursor-pointer select-none text-left"
            >
              👁️‍🌫️ Hide Component
            </button>
          )}
        </div>
      )}

      {/* Background Context Menu */}
      {contextMenu && contextMenu.widget === ("background" as any) && (
        <div
          className="fixed z-[10000] bg-[#080d1a]/95 border border-cyan-500/30 rounded-xl p-1.5 shadow-[0_10px_30px_rgba(6,182,212,0.35)] backdrop-blur-md flex flex-col gap-1 text-xs text-white min-w-[165px]"
          style={{
            left: `${Math.max(90, Math.min(typeof window !== "undefined" ? window.innerWidth - 90 : 300, contextMenu.x))}px`,
            top: `${contextMenu.y}px`,
            transform: contextMenu.y < 180 ? "translate(-50%, 15px)" : "translate(-50%, -105%)",
          }}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="px-2.5 py-1 text-[9px] font-bold text-white/40 uppercase tracking-wider select-none border-b border-white/5 pb-1.5 mb-1">
            {isMobile ? "HUD Actions" : "Desktop Actions"}
          </div>
          
          {Object.keys(hudConfig).some(key => key !== "customizerToggle" && !hudConfig[key as keyof HUDConfig].visible) ? (
            <>
              <div className="px-2.5 py-0.5 text-[8px] font-bold text-cyan-400/70 uppercase tracking-widest select-none">
                Restore Components:
              </div>
              {(Object.keys(hudConfig) as Array<keyof HUDConfig>).map((key) => {
                if (key === "customizerToggle" || hudConfig[key].visible) return null;
                if (isMobile && key === "songsToggle") return null;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      updateWidgetConfig(key, { visible: true });
                      setContextMenu(null);
                    }}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-cyan-500/20 text-white font-medium transition cursor-pointer select-none text-left text-[11px]"
                  >
                    👁️ Show {widgetLabels[key] || key}
                  </button>
                );
              })}
              <div className="h-[1px] bg-white/5 my-1" />
            </>
          ) : null}

          <button
            onClick={() => {
              setOnboardingOpen(true);
              setContextMenu(null);
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-cyan-500/20 text-cyan-400 font-semibold transition cursor-pointer select-none text-left"
          >
            ❓ Show Welcome Guide
          </button>

          <button
            onClick={() => {
              const defaultConfig = isMobile 
                ? DEFAULT_MOBILE_HUD_CONFIG 
                : isUnder1280 
                  ? DEFAULT_TABLET_HUD_CONFIG 
                  : DEFAULT_HUD_CONFIG;
              const configKey = isMobile 
                ? "bubu_mobile_hud_config" 
                : isUnder1280 
                  ? "bubu_tablet_hud_config" 
                  : "bubu_hud_config";
              setHudConfig(defaultConfig);
              localStorage.setItem(configKey, JSON.stringify(defaultConfig));
              setUnlockedWidgets({});
              setContextMenu(null);
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-red-500/20 text-red-400 font-semibold transition cursor-pointer select-none text-left"
          >
            🔄 Reset Layout Default
          </button>
        </div>
      )}

      {/* 🧠 MEMORY VAULT MODAL (Mobile or voiceMode fallback) */}
      {(isMobile || voiceMode) && memoryVaultOpen && !hudConfig.memory.visible && (
        <MemoryVault
          isOpen={memoryVaultOpen}
          onClose={() => setMemoryVaultOpen(false)}
          memory={globalMemory}
          onSaveMemory={(updated) => {
            setGlobalMemory(updated);
            localStorage.setItem("bubu_global_memory", JSON.stringify(updated));
          }}
        />
      )}

      {/* 🎵 AMBIENT MUSIC PLAYER (Mobile fallback) */}
      {isMobile && ambientPlayerOpen && !hudConfig.songs.visible && (
        <AmbientPlayer
          isOpen={ambientPlayerOpen}
          onClose={() => setAmbientPlayerOpen(false)}
        />
      )}

      {/* 📋 WORKSPACE WIDGET PANEL (Drawer overlay for screen widths < 1280px or mobile) */}
      {(isUnder1280 || isMobile) && widgetPanelOpen && !hudConfig.todo.visible && (
        <WidgetPanel
          isMobile={true}
          isOpen={widgetPanelOpen}
          onClose={() => setWidgetPanelOpen(false)}
          todos={todos}
          setTodos={setTodos}
          notes={notes}
          setNotes={setNotes}
        />
      )}

      {/* ❓ INTERACTIVE ONBOARDING WELCOME GUIDE */}
      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => {
          localStorage.setItem("bubu_onboarding_completed", "true");
          setOnboardingOpen(false);
        }}
        personality={personality}
      />
    </div>
  );
}
