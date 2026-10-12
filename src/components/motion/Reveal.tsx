"use client";

import { motion } from "framer-motion";

// Entrada suave (sobe 8px e aparece). `index` escalona itens de uma lista.
export function Reveal({
  children,
  index = 0,
  className,
}: {
  children: React.ReactNode;
  index?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut", delay: index * 0.05 }}
    >
      {children}
    </motion.div>
  );
}

// Barra de progresso que cresce até o valor.
export function ProgressFill({ percent }: { percent: number }) {
  return (
    <motion.div
      className="h-full rounded-full bg-accent"
      initial={{ width: 0 }}
      animate={{ width: `${percent}%` }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    />
  );
}
