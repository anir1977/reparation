"use client";

import { useEffect } from "react";

export function PrintTrigger() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
