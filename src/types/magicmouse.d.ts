declare module 'magicmouse.js' {
  interface MagicMouseOptions {
    cursorOuter?: 'circle-basic' | 'circle-overlay' | 'disable';
    hoverEffect?: 'circle-move' | 'pointer-blur' | 'pointer-overlay';
    hoverItemMove?: boolean;
    defaultCursor?: boolean;
    outerWidth?: number;
    outerHeight?: number;
  }

  export function magicMouse(options?: MagicMouseOptions): void;
}
