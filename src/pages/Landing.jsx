import React from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { HeroSection } from '../components/landing/HeroSection';
import { JourneySection } from '../components/landing/JourneySection';
import { MaterialInteraction } from '../components/landing/MaterialInteraction';
import { WasteFlow } from '../components/landing/WasteFlow';
import { LivePreview } from '../components/landing/LivePreview';
import { ImpactSection } from '../components/landing/ImpactSection';
import { BeforeAfter } from '../components/landing/BeforeAfter';
import { Benefits } from '../components/landing/Benefits';
import { FinalCTA } from '../components/landing/FinalCTA';

export function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-primary-500 selection:text-white">
      <LandingNavbar />
      
      <main className="flex-1">
        <HeroSection />
        <JourneySection />
        <MaterialInteraction />
        <WasteFlow />
        <LivePreview />
        <ImpactSection />
        <BeforeAfter />
        <Benefits />
        <FinalCTA />
      </main>

      <footer className="bg-slate-950 border-t border-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <span className="font-bold text-slate-300">CWMS</span>
            <span>© 2026 Construction Waste Management System</span>
          </div>
          <p>Civil Engineering Minor Project • Built with React & Framer Motion</p>
        </div>
      </footer>
    </div>
  );
}
