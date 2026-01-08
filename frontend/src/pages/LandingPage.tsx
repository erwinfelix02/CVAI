import Navbar from "../components/LandingPage/Navbar";
import { Hero } from "../components/LandingPage/Hero";
import { Stats } from "../components/LandingPage/Stats";
import { Features } from "../components/LandingPage/Features";
import { WhyCampusAI } from "../components/LandingPage/WhyCampusAI";
import { CTA } from "../components/LandingPage/CTA";
import { Footer } from "../components/LandingPage/Footer";

export default function LandingPage() {
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
