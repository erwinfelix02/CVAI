// src/components/SuperAdmin/Knowledge/types.ts
import type { LucideIcon } from "lucide-react";

export type KbTone = "slate" | "teal" | "blue" | "amber" | "mint" | "purple";

export type KbCategory = {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  tone: KbTone;
  count: number;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};
