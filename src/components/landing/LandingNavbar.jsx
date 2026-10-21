import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, PlusCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../utils/formatting';

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-white/90 backdrop-blur-md shadow-sm py-3" 
          : "bg-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Leaf className={cn("w-6 h-6", scrolled ? "text-primary-600" : "text-primary-500")} />
          <div className="flex flex-col">
            <span className={cn("font-bold text-lg leading-none transition-colors", scrolled ? "text-slate-900" : "text-white")}>CWMS</span>
            <span className={cn("text-[10px] uppercase tracking-wider font-semibold opacity-80", scrolled ? "text-slate-500" : "text-white/80")}>Construction Waste</span>
          </div>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#home" className={cn("text-sm font-medium transition-colors hover:text-primary-500", scrolled ? "text-slate-600" : "text-white/90")}>Home</a>
          <a href="#how-it-works" className={cn("text-sm font-medium transition-colors hover:text-primary-500", scrolled ? "text-slate-600" : "text-white/90")}>How It Works</a>
          <a href="#materials" className={cn("text-sm font-medium transition-colors hover:text-primary-500", scrolled ? "text-slate-600" : "text-white/90")}>Materials</a>
          <Link to="/dashboard" className={cn("text-sm font-medium transition-colors hover:text-primary-500", scrolled ? "text-slate-600" : "text-white/90")}>Dashboard</Link>
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-4">
          <Link to="/add-waste">
            <Button className={cn("gap-2", !scrolled && "bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-900 shadow-lg")}>
              <PlusCircle className="w-4 h-4" />
              Record Waste
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
