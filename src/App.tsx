import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Plus, Mic, Volume2, ArrowRight, Play } from 'lucide-react';

// Custom Scroll-Reveal Wrapper (FadeInUp)
interface FadeInUpProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const FadeInUp: React.FC<FadeInUpProps> = ({ children, delay = 0, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const currentRef = domRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div
      ref={domRef}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } ${className}`}
    >
      {children}
    </div>
  );
};

// Modern stroke-based SVG Logo (Untitled UI aesthetic)
const PletyLogo: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M16 3L27.2583 9.5V22.5L16 29L4.74167 22.5V9.5L16 3Z"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 9.5V22.5"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M10 13L16 16.5L22 13"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // Marquee Brand Logos Data
  const brandLogos = [
    { name: 'Springfield', icon: '⚡' },
    { name: 'Orbitc', icon: '🪐' },
    { name: 'Cloud', icon: '☁️' },
    { name: 'Amster', icon: '💎' },
    { name: 'Nexus', icon: '🌀' },
  ];

  // Repeat logos 4 times for seamless infinite loop
  const marqueeItems = [...brandLogos, ...brandLogos, ...brandLogos, ...brandLogos];

  // FAQ Data
  const faqData = [
    {
      q: 'Is my data safe and private with Plety?',
      a: 'Yes. All data processing is end-to-end encrypted with strict zero-retention policies on your conversations and audio streams. Your data is never used to train public AI models.',
    },
    {
      q: 'How fast does the speech recognition process audio?',
      a: 'Our low-latency engine streams transcriptions in real time under 200ms with over 99% accuracy across 30+ global languages and accents.',
    },
    {
      q: 'Can I integrate Plety into my existing workflow?',
      a: 'Absolutely. Plety provides REST and WebSocket APIs alongside official SDKs for React, Node, Python, and iOS out of the box.',
    },
    {
      q: 'Is there a free trial available?',
      a: 'Yes! All new accounts start with a 14-day free trial containing full access to API 2.0, AI Chat, and AI Transcription features without requiring a credit card.',
    },
    {
      q: 'What support options are available for enterprise plans?',
      a: 'Enterprise plans include 24/7 dedicated support, custom SLA guarantees, SOC-2 compliance documentation, and dedicated AI fine-tuning for custom vocabularies.',
    },
  ];

  return (
    <div className="bg-black text-white min-h-screen font-sans selection:bg-white selection:text-black">
      
      {/* 1. Navigation Bar (Sticky & Responsive) */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-black/80 backdrop-blur-md border-b border-white/10 py-4 shadow-2xl'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* Logo */}
          <button
            onClick={() => handleNavClick('about')}
            className="flex items-center gap-2.5 text-white group cursor-pointer"
          >
            <PletyLogo className="w-7 h-7 text-white transition-transform group-hover:scale-110" />
            <span className="font-bold text-xl tracking-tight">Plety</span>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => handleNavClick('about')}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              onClick={() => handleNavClick('features')}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => handleNavClick('faq')}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              FAQ
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              Contact
            </button>
          </div>

          {/* Right Desktop CTA */}
          <div className="hidden md:flex items-center">
            <button
              onClick={() => handleNavClick('about')}
              className="bg-[#1F1F22] hover:bg-[#2A2A2D] text-white text-sm font-medium px-5 py-2.5 rounded-full border border-white/5 shadow-md transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              Get started
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white p-2"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/95 border-b border-white/10 px-6 py-6 space-y-4 backdrop-blur-xl animate-fade-in">
            <button
              onClick={() => handleNavClick('about')}
              className="block w-full text-left text-base font-medium text-gray-300 hover:text-white py-2"
            >
              About
            </button>
            <button
              onClick={() => handleNavClick('features')}
              className="block w-full text-left text-base font-medium text-gray-300 hover:text-white py-2"
            >
              Features
            </button>
            <button
              onClick={() => handleNavClick('faq')}
              className="block w-full text-left text-base font-medium text-gray-300 hover:text-white py-2"
            >
              FAQ
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className="block w-full text-left text-base font-medium text-gray-300 hover:text-white py-2"
            >
              Contact
            </button>
            <div className="pt-2">
              <button
                onClick={() => handleNavClick('about')}
                className="w-full bg-[#1F1F22] hover:bg-[#2A2A2D] text-white text-sm font-medium py-3 rounded-full border border-white/5 transition-all text-center"
              >
                Get started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* 2. Hero Section (id="about") */}
      <section
        id="about"
        className="min-h-screen flex flex-col items-center justify-center pt-32 pb-20 relative z-0 overflow-hidden"
      >
        {/* Background Video */}
        <video
          src="https://cdn.sceneai.art/Hero%20Section%20Video/50b4f304-cdca-4e12-8735-580d225834be.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 -z-10 object-cover min-w-full min-h-full opacity-90"
        />
        
        {/* Video Overlay Gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/30 via-transparent to-black" />

        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center">
          
          {/* Top Badge */}
          <FadeInUp delay={100}>
            <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300 mb-8 backdrop-blur-sm shadow-sm inline-flex items-center gap-1.5">
              <span>✨ Announcing API 2.0</span>
            </div>
          </FadeInUp>

          {/* Headline */}
          <FadeInUp delay={200}>
            <h1 className="text-5xl md:text-7xl font-medium tracking-tight mb-6 text-center leading-[1.15] text-white">
              The intelligence layer <br className="hidden md:inline" />
              for clear <span className="font-serif italic font-normal text-white">decisions.</span>
            </h1>
          </FadeInUp>

          {/* Sub-text */}
          <FadeInUp delay={300}>
            <p className="text-[16px] text-gray-400 max-w-2xl text-center mb-10 leading-relaxed">
              Our platform integrates seamlessly into your stack to deliver real-time understanding, not just predictions.
            </p>
          </FadeInUp>

          {/* Buttons Flex Row */}
          <FadeInUp delay={400}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <button
                onClick={() => handleNavClick('features')}
                className="w-full sm:w-auto bg-white hover:bg-gray-100 text-black font-medium text-sm px-6 py-3 rounded-full transition-all hover:shadow-lg hover:shadow-white/10 hover:scale-[1.02] active:scale-95 cursor-pointer shadow-md"
              >
                Get started
              </button>
              <button
                onClick={() => handleNavClick('features')}
                className="w-full sm:w-auto bg-[#1F1F22] hover:bg-[#2A2A2D] text-white font-medium text-sm px-6 py-3 rounded-full border border-white/5 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-md"
              >
                Learn more
              </button>
            </div>
          </FadeInUp>

        </div>

        {/* Marquee (Trusted by industry leaders) */}
        <div className="w-full mt-24">
          <FadeInUp delay={500}>
            <p className="text-sm text-gray-500 font-medium mb-8 text-center uppercase tracking-wider">
              Trusted by industry leaders
            </p>
          </FadeInUp>

          {/* Flawless Infinite Marquee Wrapper */}
          <div className="relative overflow-hidden w-full max-w-6xl mx-auto [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
            <div className="flex w-max animate-marquee py-2">
              {marqueeItems.map((brand, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 px-8 flex items-center gap-2.5 text-gray-400 font-semibold text-lg hover:text-white transition-colors"
                >
                  <span className="text-xl">{brand.icon}</span>
                  <span className="tracking-tight">{brand.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>

      {/* 3. Feature 1: AI Chat (id="features") */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Text */}
          <FadeInUp delay={100}>
            <div>
              <span className="text-xs font-medium text-amber-400 mb-4 inline-block tracking-wide uppercase">
                ✨ AI chat
              </span>
              <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-6 leading-tight">
                Where speed meets intelligent conversation.
              </h2>
              <p className="text-gray-400 text-base leading-relaxed mb-8">
                A conversational AI assistant that understands your questions, provides intelligent answers, and helps you get things done fast from casual chats to complex tasks.
              </p>
              <button
                onClick={() => handleNavClick('contact')}
                className="bg-white hover:bg-gray-100 text-black font-medium text-sm px-6 py-3 rounded-full inline-flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-md"
              >
                <span>Get started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </FadeInUp>

          {/* Right Mockup */}
          <FadeInUp delay={300}>
            <div className="rounded-3xl overflow-hidden p-6 md:p-8 border border-white/10 relative group min-h-[420px] flex items-end justify-center shadow-2xl bg-black/60">
              
              {/* Background Video */}
              <video
                src="https://cdn.sceneai.art/Hero%20Section%20Video/1bcc8fa3-37f6-4c53-8591-0347e4c7f8ac.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 object-cover w-full h-full opacity-80 transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

              {/* Floating UI Card */}
              <div className="bg-[#1C1C1E]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 w-full relative z-10 shadow-2xl space-y-4">
                
                {/* Top Chips */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs text-gray-200 hover:bg-white/20 transition-colors cursor-pointer">
                    ✨ Create image
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 hover:bg-white/10 transition-colors cursor-pointer">
                    Summarize text
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 hover:bg-white/10 transition-colors cursor-pointer">
                    Draft code
                  </span>
                </div>

                {/* Bottom Input Area */}
                <div className="flex items-center justify-between bg-black/50 border border-white/10 rounded-xl p-3">
                  <span className="text-sm text-gray-400">Ask anything...</span>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Mic className="w-4 h-4 hover:text-white transition-colors cursor-pointer" />
                    <Volume2 className="w-4 h-4 hover:text-white transition-colors cursor-pointer" />
                  </div>
                </div>

              </div>

            </div>
          </FadeInUp>

        </div>
      </section>

      {/* 4. Feature 2: AI Transcription */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Mockup */}
          <FadeInUp delay={100} className="order-2 lg:order-1">
            <div className="rounded-3xl overflow-hidden p-6 md:p-8 border border-white/10 relative group min-h-[420px] flex items-end justify-center shadow-2xl bg-black/60">
              
              {/* Background Video */}
              <video
                src="https://cdn.sceneai.art/Hero%20Section%20Video/736fd4a0-70ac-4f44-9633-55769ead6aca.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 object-cover w-full h-full opacity-80 transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

              {/* Floating UI Card */}
              <div className="bg-[#1C1C1E]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 w-full relative z-10 shadow-2xl space-y-3">
                
                {/* Audio Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Play className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">11:06 AM – Chris</div>
                      <div className="text-[10px] text-gray-400">Weekly Executive Sync</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    02:45
                  </span>
                </div>

                {/* Audio Waveform Graphic */}
                <div className="flex items-center gap-1 py-1">
                  {[40, 70, 30, 90, 50, 80, 100, 60, 30, 80, 50, 90, 40, 70, 30].map((h, idx) => (
                    <div
                      key={idx}
                      className="flex-1 bg-emerald-400/80 rounded-full transition-all"
                      style={{ height: `${h * 0.25}px` }}
                    />
                  ))}
                </div>

                {/* Dummy Transcription Text */}
                <div className="text-xs text-gray-300 leading-relaxed font-mono bg-black/40 p-3 rounded-xl border border-white/5">
                  "We've aligned on the Q3 roadmap milestones. Integrating real-time speech recognition ensures zero lost insights across all team syncs."
                </div>

              </div>

            </div>
          </FadeInUp>

          {/* Right Text */}
          <FadeInUp delay={300} className="order-1 lg:order-2">
            <div>
              <span className="text-xs font-medium text-emerald-400 mb-4 inline-block tracking-wide uppercase">
                ✨ AI transcription
              </span>
              <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-6 leading-tight">
                Turn speech into text with speed and precision.
              </h2>
              <p className="text-gray-400 text-base leading-relaxed mb-8">
                Automatically convert speech into accurate, editable text in real time. Perfect for meetings, interviews, voice notes, and more, powered by advanced speech recognition technology.
              </p>
              <button
                onClick={() => handleNavClick('contact')}
                className="bg-white hover:bg-gray-100 text-black font-medium text-sm px-6 py-3 rounded-full inline-flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-md"
              >
                <span>Get started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </FadeInUp>

        </div>
      </section>

      {/* 5. FAQ Section (id="faq") */}
      <section id="faq" className="py-32 px-6 max-w-3xl mx-auto border-t border-white/5">
        
        <FadeInUp delay={100}>
          <h2 className="text-center text-4xl md:text-5xl font-semibold text-white mb-12 tracking-tight">
            We've got answers
          </h2>
        </FadeInUp>

        {/* Container Styling: Transparent background with visible border */}
        <FadeInUp delay={200}>
          <div className="border border-white/10 rounded-xl bg-transparent overflow-hidden">
            {faqData.map((item, idx) => (
              <div
                key={idx}
                className={idx !== faqData.length - 1 ? 'border-b border-white/10' : ''}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="py-6 px-6 flex items-center justify-between w-full text-left font-medium text-base text-white hover:text-gray-200 transition-colors cursor-pointer"
                >
                  <span>{item.q}</span>
                  <span
                    className={`ml-4 transform transition-transform duration-300 flex items-center justify-center text-gray-400 ${
                      openFaqIndex === idx ? 'rotate-45 text-white' : ''
                    }`}
                  >
                    <Plus className="w-5 h-5" />
                  </span>
                </button>

                {/* CSS Grid Accordion Trick */}
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    openFaqIndex === idx ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-gray-400 text-sm pb-6 px-6 leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </FadeInUp>

      </section>

      {/* 6. Footer Section (id="contact") */}
      <footer id="contact" className="relative z-0 pt-32 pb-10 px-6 border-t border-white/5 overflow-hidden">
        
        {/* Background Video */}
        <video
          src="https://cdn.sceneai.art/Hero%20Section%20Video/50b4f304-cdca-4e12-8735-580d225834be.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 -z-10 object-cover w-full h-full opacity-40"
        />

        {/* Strong Overlay Gradient for readability */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black via-black/60 to-black" />

        {/* Top CTA */}
        <div className="max-w-4xl mx-auto text-center mb-32">
          <FadeInUp delay={100}>
            <h2 className="text-4xl md:text-6xl font-medium tracking-tight text-white mb-8 leading-tight">
              Ready to automate <br className="hidden md:inline" />
              <span className="font-serif italic font-normal text-white">everything?</span>
            </h2>
          </FadeInUp>

          <FadeInUp delay={200}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => handleNavClick('about')}
                className="w-full sm:w-auto bg-white hover:bg-gray-100 text-black font-medium text-sm px-6 py-3 rounded-full transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-md"
              >
                Get started
              </button>
              <button
                onClick={() => handleNavClick('features')}
                className="w-full sm:w-auto bg-[#1F1F22] hover:bg-[#2A2A2D] text-white font-medium text-sm px-6 py-3 rounded-full border border-white/5 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-md"
              >
                Learn more
              </button>
            </div>
          </FadeInUp>
        </div>

        {/* Link Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto mb-24">
          
          {/* Col 1: Brand */}
          <div>
            <div className="flex items-center gap-2.5 text-white mb-3">
              <PletyLogo className="w-6 h-6 text-white" />
              <span className="text-xl font-bold tracking-tight">Plety</span>
            </div>
            <p className="text-sm text-gray-400">
              Speed, scale, and smarts — deployed.
            </p>
          </div>

          {/* Col 2: Product */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-2.5">
              {['About', 'Pricing', 'Changelog', 'Contact'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => handleNavClick(item.toLowerCase())}
                    className="text-sm text-gray-400 hover:text-white transition-colors block cursor-pointer"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2.5">
              {['Terms of service', 'Privacy policy', '404'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-white transition-colors block"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Connect */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Connect</h3>
            <ul className="space-y-2.5">
              {['Instagram', 'YouTube', 'LinkedIn', 'Twitter / X'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-white transition-colors block"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-4 text-xs text-gray-500 border-t border-white/5 pt-8 max-w-7xl mx-auto text-center">
          <span>© 2026 Plety. All rights reserved</span>
          <span className="hidden md:inline">•</span>
          <span>
            by <span className="text-gray-300 font-medium">Re-text</span>
          </span>
          <span className="hidden md:inline">•</span>
          <span>
            Made in <span className="text-gray-300 font-medium">Gemini</span>
          </span>
        </div>

      </footer>

    </div>
  );
}

export default App;
