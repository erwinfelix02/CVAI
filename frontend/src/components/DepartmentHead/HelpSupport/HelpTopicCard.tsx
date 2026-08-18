// ✅ src/components/DepartmentHead/HelpSupport/HelpTopicCard.tsx

import type { LucideIcon } from "lucide-react";

export interface HelpTopic {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

interface HelpTopicCardProps {
  topic: HelpTopic;
  onClick?: (topic: HelpTopic) => void;
}

export default function HelpTopicCard({
  topic,
  onClick,
}: HelpTopicCardProps) {
  const Icon = topic.icon;

  return (
    <button
      type="button"
      className="help-topic-card"
      onClick={() => onClick?.(topic)}
    >
      <div className="help-topic-icon">
        <Icon
          size={25}
          strokeWidth={1.8}
        />
      </div>

      <div className="help-topic-content">
        <h3>{topic.title}</h3>

        <p>{topic.description}</p>
      </div>
    </button>
  );
}