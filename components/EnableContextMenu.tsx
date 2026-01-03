'use client';

import { useEffect } from 'react';

export default function EnableContextMenu() {
  useEffect(() => {
    // Explicitly ensure context menu is not blocked
    // This listener runs in the capture phase (before other listeners)
    // to ensure we don't prevent the default context menu behavior
    const allowContextMenu = (e: MouseEvent) => {
      // Explicitly do NOT call preventDefault
      // This ensures the standard browser context menu appears
    };

    // Add listeners in capture phase to run before any potential blocking listeners
    document.addEventListener('contextmenu', allowContextMenu, { 
      capture: true,
      passive: true // Passive listener cannot call preventDefault
    });
    
    window.addEventListener('contextmenu', allowContextMenu, { 
      capture: true,
      passive: true
    });

    // Also ensure body and html don't have blocking listeners
    document.body.addEventListener('contextmenu', allowContextMenu, { 
      capture: true,
      passive: true
    });

    return () => {
      document.removeEventListener('contextmenu', allowContextMenu, { capture: true });
      window.removeEventListener('contextmenu', allowContextMenu, { capture: true });
      document.body.removeEventListener('contextmenu', allowContextMenu, { capture: true });
    };
  }, []);

  return null;
}

