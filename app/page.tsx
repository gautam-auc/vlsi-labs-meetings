import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import ProductPreview from "../components/landing/ProductPreview";
import Features from "../components/landing/Features";
import Workflow from "../components/landing/Workflow";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";
import ScrollToTopOnLoad from "../components/landing/ScrollToTopOnLoad";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      <ScrollToTopOnLoad />
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