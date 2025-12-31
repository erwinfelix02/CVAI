import Navbar from "../components/Navbar";
import { Hero } from "../components/Hero";
import { Stats } from "../components/Stats";
import { Features } from "../components/Features";
import { WhyCampusAI } from "../components/WhyCampusAI";
import { CTA } from "../components/CTA";
import { Footer } from "../components/Footer";

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
