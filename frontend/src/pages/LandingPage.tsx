import { useEffect } from "react";
import Navbar from "../components/LandingPage/Navbar";
import { Hero } from "../components/LandingPage/Hero";
import { Stats } from "../components/LandingPage/Stats";
import { Features } from "../components/LandingPage/Features";
import { WhyCampusAI } from "../components/LandingPage/WhyCampusAI";
import { CTA } from "../components/LandingPage/CTA";
import { Footer } from "../components/LandingPage/Footer";

export default function LandingPage() {
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          } else {
            entry.target.classList.remove("is-visible");
          }
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <WhyCampusAI />
      <CTA />
      <Footer />
    </>
  );
}
