export interface HUDComponentConfig {
  x: number; // left percentage
  y: number; // top percentage
  w: number; // width percentage
  h: number; // height percentage
  scale: number; // scale multiplier
  opacity: number; // opacity level
  visible: boolean;
}

export interface HUDConfig {
  header: HUDComponentConfig;
  sidebar: HUDComponentConfig;
  chat: HUDComponentConfig;
  visualizer: HUDComponentConfig;
  todo: HUDComponentConfig;
  songs: HUDComponentConfig;
  memory: HUDComponentConfig;
  todoToggle: HUDComponentConfig;
  songsToggle: HUDComponentConfig;
  memoryToggle: HUDComponentConfig;
  customizerToggle: HUDComponentConfig;
}

export const DEFAULT_HUD_CONFIG: HUDConfig = {
  header: { x: 1, y: 1, w: 98, h: 8, scale: 1.0, opacity: 1.0, visible: true },
  sidebar: { x: 1, y: 11, w: 22, h: 86, scale: 1.0, opacity: 1.0, visible: true },
  chat: { x: 24, y: 11, w: 34, h: 86, scale: 1.0, opacity: 1.0, visible: true },
  visualizer: { x: 59, y: 11, w: 40, h: 86, scale: 1.0, opacity: 1.0, visible: true },
  todo: { x: 24, y: 11, w: 22, h: 86, scale: 1.0, opacity: 1.0, visible: true },
  songs: { x: 74, y: 55, w: 25, h: 41, scale: 1.0, opacity: 1.0, visible: true },
  memory: { x: 25, y: 15, w: 50, h: 70, scale: 1.0, opacity: 1.0, visible: true },
  todoToggle: { x: 80, y: 3, w: 3, h: 6, scale: 1.0, opacity: 1.0, visible: true },
  songsToggle: { x: 84, y: 3, w: 3, h: 6, scale: 1.0, opacity: 1.0, visible: true },
  memoryToggle: { x: 88, y: 3, w: 3, h: 6, scale: 1.0, opacity: 1.0, visible: true },
  customizerToggle: { x: 92, y: 3, w: 3, h: 6, scale: 1.0, opacity: 1.0, visible: true },
};

export const DEFAULT_MOBILE_HUD_CONFIG: HUDConfig = {
  header: { x: 2, y: 1, w: 96, h: 8, scale: 1.0, opacity: 1.0, visible: true },
  sidebar: { x: 2, y: 10, w: 96, h: 78, scale: 1.0, opacity: 1.0, visible: false },
  chat: { x: 2, y: 10, w: 96, h: 78, scale: 1.0, opacity: 1.0, visible: true },
  visualizer: { x: 15, y: 15, w: 70, h: 40, scale: 1.0, opacity: 1.0, visible: false },
  todo: { x: 5, y: 15, w: 90, h: 70, scale: 1.0, opacity: 1.0, visible: false },
  songs: { x: 5, y: 25, w: 90, h: 50, scale: 1.0, opacity: 1.0, visible: false },
  memory: { x: 5, y: 15, w: 90, h: 70, scale: 1.0, opacity: 1.0, visible: false },
  todoToggle: { x: 15, y: 90, w: 12, h: 6, scale: 1.0, opacity: 1.0, visible: true },
  songsToggle: { x: 35, y: 90, w: 12, h: 6, scale: 1.0, opacity: 1.0, visible: true },
  memoryToggle: { x: 55, y: 90, w: 12, h: 6, scale: 1.0, opacity: 1.0, visible: true },
  customizerToggle: { x: 75, y: 90, w: 12, h: 6, scale: 1.0, opacity: 1.0, visible: true },
};

