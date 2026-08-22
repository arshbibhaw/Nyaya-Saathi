import { motion } from "framer-motion";

export function TypingIndicator() {
  return (
    <div className="flex w-fit items-center gap-1.5 rounded-2xl rounded-bl-none border border-border/50 bg-card/50 p-4 backdrop-blur-sm">
      <motion.div
        className="size-2 rounded-full bg-primary/60"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0 }}
      />
      <motion.div
        className="size-2 rounded-full bg-primary/60"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
      />
      <motion.div
        className="size-2 rounded-full bg-primary/60"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
      />
    </div>
  );
}
