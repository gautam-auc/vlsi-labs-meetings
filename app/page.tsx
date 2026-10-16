import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import ProductPreview from "../components/landing/ProductPreview";
import Features from "../components/landing/Features";
import Workflow from "../components/landing/Workflow";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text)] transition-colors duration-200">
      <Navbar />
      <Hero />
      <ProductPreview />
      <Features />
      <Workflow />
      <CTA />
      <Footer />
    </main>
  );
}