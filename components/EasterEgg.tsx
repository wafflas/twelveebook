"use client";

import { useEffect } from "react";

export default function EasterEgg() {
  useEffect(() => {
    console.log(`
██████   ██████   ██ ██████  
     ██ ██  ████ ███      ██ 
 █████  ██ ██ ██  ██  █████  
██      ████  ██  ██ ██      
███████  ██████   ██ ███████ 
    `);
  }, []);

  return null;
}
