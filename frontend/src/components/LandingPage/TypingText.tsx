import { useEffect, useRef, useState } from "react";

type TypingTextProps = {
  text: string;
  speed?: number;
  onDone?: () => void;
};

export default function TypingText({
  text,
  speed = 35,
  onDone,
}: TypingTextProps) {
  const [displayed, setDisplayed] = useState("");
  const calledRef = useRef(false);

  useEffect(() => {
    let index = 0;
    calledRef.current = false;
    setDisplayed("");

    const interval = setInterval(() => {
      index++;

      setDisplayed(text.slice(0, index));

      if (index >= text.length) {
        clearInterval(interval);

        if (!calledRef.current) {
          calledRef.current = true;
          onDone?.();
        }
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onDone]);

  const done = displayed.length >= text.length;

  return (
    <span>
      {displayed}
      {!done && <span className="typing-cursor">|</span>}
    </span>
  );
}
