import FaqItem from "./FaqItem";

type FaqEntry = {
  id: string;
  question: string;
  answer: string;
};

type Props = {
  title: string;
  items: FaqEntry[];
};

export default function FaqSection({ title, items }: Props) {
  return (
    <div className="rh-faq-section">
      <div className="d-flex align-items-center gap-2 mb-3">
        <h3 className="rh-faq-section-title mb-0">{title}</h3>
        <span className="rh-count-badge">{items.length}</span>
      </div>

      <div className="rh-faq-list">
        {items.map((item) => (
          <FaqItem
            key={item.id}
            id={item.id}
            question={item.question}
            answer={item.answer}
          />
        ))}
      </div>
    </div>
  );
}