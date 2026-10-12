"use client";

import { MotionConfig } from "framer-motion";

// Animações respeitam "reduzir movimento" do aparelho (CLAUDE.md).
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
