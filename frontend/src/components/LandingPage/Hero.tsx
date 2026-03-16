import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Authentication/Button";
import "../../styles/hero.css";
import { MessageCircle, X, ChevronLeft, ChevronRight } from "lucide-react";
import AiIcon from "../../assets/ai.png";
import ChatPreview from "./ChatPreview";

import DemoRegistration1 from "../../assets/demo1.jpeg";
import DemoRegistration2 from "../../assets/demo2.jpeg";
import DemoRegistration3 from "../../assets/demo3.jpeg";
import DemoRegistration4 from "../../assets/demo4.jpeg";
import DemoChatScreen from "../../assets/demo5.jpeg";

type Sender = "user" | "ai";

type ChatMessage = {
  sender: Sender;
  text: string;
};

type DemoSlide =
  | {
      type: "image";
      src: string;
      title: string;
      description: string;
    }
  | {
      type: "chat";
      src: string;
      title: string;
      description: string;
    };

type TypingChatDemoProps = {
  isActive: boolean;
  onComplete: () => void;
};

const typingMessages: ChatMessage[] = [
  {
    sender: "user",
    text: "How can I request a transcript?",
  },
  {
    sender: "ai",
    text: "You can request a transcript through the registrar's office or the student portal under Documents. Prepare your student ID and payment for processing fees if required.",
  },
  {
    sender: "user",
    text: "When is the deadline for enrollment?",
  },
  {
    sender: "ai",
    text: "Enrollment deadlines are posted in the announcements section. You can also ask the registrar for the latest academic calendar.",
  },
];

function TypingChatDemo({ isActive, onComplete }: TypingChatDemoProps) {
  const [visibleMessages, setVisibleMessages] = useState<ChatMessage[]>([]);
  const [typedText, setTypedText] = useState<string>("");
  const [currentMessageIndex, setCurrentMessageIndex] = useState<number>(0);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!isActive) {
      setVisibleMessages([]);
      setTypedText("");
      setCurrentMessageIndex(0);
      completedRef.current = false;
      return;
    }

    let charIndex = 0;
    let typingInterval: ReturnType<typeof setInterval> | undefined;
    let nextMessageTimeout: ReturnType<typeof setTimeout> | undefined;

    const typeCurrentMessage = (messageIndex: number) => {
      if (messageIndex >= typingMessages.length) {
        if (!completedRef.current) {
          completedRef.current = true;
          nextMessageTimeout = setTimeout(() => {
            onComplete();
          }, 1400);
        }
        return;
      }

      const currentMessage = typingMessages[messageIndex];
      setTypedText("");

      typingInterval = setInterval(
        () => {
          charIndex += 1;
          setTypedText(currentMessage.text.slice(0, charIndex));

          if (charIndex >= currentMessage.text.length) {
            if (typingInterval) clearInterval(typingInterval);

            setVisibleMessages((prev) => [
              ...prev,
              {
                sender: currentMessage.sender,
                text: currentMessage.text,
              },
            ]);

            setTypedText("");
            charIndex = 0;

            nextMessageTimeout = setTimeout(() => {
              setCurrentMessageIndex((prev) => prev + 1);
            }, 700);
          }
        },
        currentMessage.sender === "ai" ? 16 : 24,
      );
    };

    typeCurrentMessage(currentMessageIndex);

    return () => {
      if (typingInterval) clearInterval(typingInterval);
      if (nextMessageTimeout) clearTimeout(nextMessageTimeout);
    };
  }, [currentMessageIndex, isActive, onComplete]);

  const currentlyTypingMessage: ChatMessage | null =
    isActive && currentMessageIndex < typingMessages.length
      ? typingMessages[currentMessageIndex]
      : null;

  return (
    <div className="typing-demo-shell">
      <div className="typing-demo-header">
        <div className="typing-demo-icon-wrap">
          <img src={AiIcon} alt="Campus AI" className="typing-demo-icon" />
        </div>
        <h3>Campus AI Assistant</h3>
        <p>
          Ask about schedules, grades, fees, documents, and campus services.
        </p>
      </div>

      <div className="typing-demo-chat">
        {visibleMessages.map((message, index) => (
          <div
            key={index}
            className={`typing-bubble ${
              message.sender === "user" ? "user-bubble" : "ai-bubble"
            }`}
          >
            {message.text}
          </div>
        ))}

        {currentlyTypingMessage && typedText && (
          <div
            className={`typing-bubble ${
              currentlyTypingMessage.sender === "user"
                ? "user-bubble"
                : "ai-bubble"
            }`}
          >
            {typedText}
            <span className="typing-caret" />
          </div>
        )}
      </div>

      <div className="typing-demo-input">
        <span>Ask me anything about your campus...</span>
        <button type="button">Send</button>
      </div>
    </div>
  );
}

export function Hero() {
  const navigate = useNavigate();
  const [showDemo, setShowDemo] = useState<boolean>(false);
  const [currentDemo, setCurrentDemo] = useState<number>(0);
  const autoSlideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const demoSlides = useMemo<DemoSlide[]>(
    () => [
      {
        type: "image",
        src: DemoRegistration1,
        title: "Student Pre-Registration",
        description: "Fill out personal information to begin the application.",
      },
      {
        type: "image",
        src: DemoRegistration2,
        title: "Academic Information",
        description: "Select applicant type and preferred course or program.",
      },
      {
        type: "image",
        src: DemoRegistration3,
        title: "Required Documents Upload",
        description: "Upload the required PDF documents for evaluation.",
      },
      {
        type: "image",
        src: DemoRegistration4,
        title: "Application Review and Submission",
        description: "Review all details and submit the application.",
      },
      {
        type: "chat",
        src: DemoChatScreen,
        title: "Campus AI Assistant",
        description: "Students can ask questions and get quick help anytime.",
      },
    ],
    [],
  );

  const openDemo = () => {
    setCurrentDemo(0);
    setShowDemo(true);
  };

  const closeDemo = () => {
    setShowDemo(false);
    if (autoSlideRef.current) {
      clearTimeout(autoSlideRef.current);
      autoSlideRef.current = null;
    }
  };

  const nextDemo = () => {
    setCurrentDemo((prev) => (prev + 1) % demoSlides.length);
  };

  const prevDemo = () => {
    setCurrentDemo(
      (prev) => (prev - 1 + demoSlides.length) % demoSlides.length,
    );
  };

  useEffect(() => {
    if (!showDemo) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDemo();
      if (e.key === "ArrowRight") nextDemo();
      if (e.key === "ArrowLeft") prevDemo();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showDemo, demoSlides.length]);

  useEffect(() => {
    if (!showDemo) return;

    if (autoSlideRef.current) {
      clearTimeout(autoSlideRef.current);
      autoSlideRef.current = null;
    }

    const currentSlide = demoSlides[currentDemo];

    if (currentSlide.type === "image") {
      autoSlideRef.current = setTimeout(() => {
        nextDemo();
      }, 2500);
    }

    return () => {
      if (autoSlideRef.current) {
        clearTimeout(autoSlideRef.current);
        autoSlideRef.current = null;
      }
    };
  }, [showDemo, currentDemo, demoSlides]);

  return (
    <>
      <section className="hero-section text-center position-relative overflow-hidden">
        <div className="container py-5">
          <span className="hero-badge mb-3">
            <img src={AiIcon} alt="" className="badge-icon" />
            AI-Powered Campus Assistant
          </span>

          <h1 className="hero-title mt-3">
            Your Smart Companion for <br />
            <span className="hero-highlight">Campus Life</span>
          </h1>

          <p className="lead mt-3 mx-auto hero-text" style={{ maxWidth: 720 }}>
            Get instant answers about courses, schedules, campus resources, and
            everything you need for academic success. Available 24/7, just for
            you.
          </p>

          <div className="d-flex flex-column flex-sm-row justify-content-center align-items-center gap-3 mt-4">
            <Button
              className="hero-cta px-4 d-inline-flex align-items-center gap-2"
              onClick={() => navigate("/signin")}
            >
              Get Started
              <MessageCircle size={18} />
            </Button>

            <Button
              variant="whiteBorder"
              className="hero-demo"
              onClick={openDemo}
            >
              Watch Demo
            </Button>
          </div>

          <div className="mt-5 d-flex justify-content-center">
            <ChatPreview />
          </div>
        </div>
      </section>

      {showDemo && (
        <div className="demo-modal-overlay" onClick={closeDemo}>
          <div
            className="demo-modal-content"
            onClick={(e: React.MouseEvent<HTMLDivElement>) =>
              e.stopPropagation()
            }
          >
            <button className="demo-close-btn" onClick={closeDemo}>
              <X size={20} />
            </button>

            <div className="demo-topbar">
              <div className="demo-slide-counter">
                {demoSlides[currentDemo].title}
              </div>

              <div className="demo-dots">
                {demoSlides.map((_, index) => (
                  <span
                    key={index}
                    className={`demo-dot ${
                      index === currentDemo ? "active" : ""
                    }`}
                    onClick={() => setCurrentDemo(index)}
                  />
                ))}
              </div>
            </div>

            <div className="demo-stage">
              {demoSlides[currentDemo].type === "image" ? (
                <div className="demo-image-wrapper">
                  <img
                    src={demoSlides[currentDemo].src}
                    alt={demoSlides[currentDemo].title}
                    className="demo-image"
                  />
                </div>
              ) : (
                <TypingChatDemo
                  isActive={showDemo && demoSlides[currentDemo].type === "chat"}
                  onComplete={nextDemo}
                />
              )}
            </div>

            <div className="demo-controls">
              <button className="demo-nav-btn" onClick={prevDemo}>
                <ChevronLeft size={18} />
              </button>

              <button className="demo-nav-btn" onClick={nextDemo}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
