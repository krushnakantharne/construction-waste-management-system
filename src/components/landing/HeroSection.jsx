import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Recycle, PackageCheck, MapPin } from 'lucide-react';
import { Button } from '../ui/Button';
import constructionSiteImg from '../../assets/construction-site.png';

export function HeroSection() {
  const { scrollY } = useScroll();
  const yImage = useTransform(scrollY, [0, 800], [0, 150]);
  const yText = useTransform(scrollY, [0, 800], [0, -50]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden bg-slate-950">
      
      {/* Background Graphic elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Subtle grid/blueprint background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
        
        {/* Left: Text Content */}
        <motion.div 
          style={{ opacity, y: yText }}
          className="flex-1 text-center lg:text-left mt-8 lg:mt-0 z-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-semibold tracking-wider uppercase mb-6 backdrop-blur-md shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
              Construction • Sustainability
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6 leading-[1.1]"
          >
            Turn Construction <br className="hidden sm:block" />
            Waste Into a <br className="hidden lg:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-success-400">
              Managed Resource.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="text-lg text-slate-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed"
          >
            A smart construction waste management system for tracking, segregating, reusing, recycling, and responsibly disposing of construction waste.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
          >
            <Link to="/dashboard">
              <Button size="lg" className="w-full sm:w-auto gap-2 text-base px-8 py-4 shadow-lg shadow-primary-900/20">
                Explore System
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/add-waste">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto text-slate-300 hover:text-white hover:bg-slate-800/50 border border-slate-700 backdrop-blur-sm">
                Record Waste
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Right: Realistic Image with Data Overlays */}
        <motion.div 
          style={{ y: yImage }}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="flex-1 w-full max-w-2xl lg:max-w-none relative z-10"
        >
          {/* Main Image Container */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl bg-slate-900 group">
            
            {/* Very slow continuous zoom effect on the image */}
            <motion.div
               animate={{ scale: [1, 1.05, 1] }}
               transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
               className="w-full h-[500px] lg:h-[600px] relative"
            >
              {/* High Quality Construction Photo - Active modern construction site */}
              <img 
                src={constructionSiteImg}
                alt="Active modern construction site" 
                className="w-full h-full object-cover object-center"
              />
              
              {/* Gradient overlays to blend into background and keep text readable */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 to-transparent lg:hidden" />
            </motion.div>

            {/* Subtle Blueprint Overlay directly over the image */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgwem0yMCAyMGgyMHYyMEgyMHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyIvPjwvc3ZnPg==')] opacity-40 pointer-events-none mix-blend-overlay" />
            
            {/* Subtle location marker */}
            <div className="absolute top-6 right-6 flex items-center gap-2 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
              <MapPin className="w-3.5 h-3.5 text-primary-400" />
              <span className="text-xs font-medium text-slate-200">Site Sector 4</span>
            </div>

            {/* Floating Data Card 1: Waste Tracked */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="absolute top-1/4 -left-4 sm:-left-8 lg:-left-12 bg-slate-900/70 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center border border-primary-500/30 shadow-inner">
                <BarChart3 className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Waste Tracked</p>
                <p className="text-xl font-bold text-white leading-none">12.5 T</p>
              </div>
            </motion.div>

            {/* Floating Data Card 2: Material Recovered */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="absolute bottom-1/4 -right-4 sm:-right-8 lg:-right-6 bg-slate-900/70 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-success-500/20 flex items-center justify-center border border-success-500/30 shadow-inner">
                <PackageCheck className="w-5 h-5 text-success-400" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Material Recovered</p>
                <p className="text-xl font-bold text-white leading-none">10.0 T</p>
              </div>
            </motion.div>

            {/* Floating Data Card 3: Recovery Rate */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="absolute bottom-6 left-6 bg-slate-900/80 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-xl flex items-center gap-3"
            >
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center z-20 border-2 border-slate-900 shadow-sm">
                  <Recycle className="w-4 h-4 text-white" />
                </div>
                <div className="w-8 h-8 rounded-full bg-success-600 flex items-center justify-center z-10 border-2 border-slate-900 shadow-sm">
                  <span className="text-[10px] font-bold text-white">80%</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">Recovery Rate</p>
                <p className="text-[10px] text-slate-400">Target: 75%</p>
              </div>
            </motion.div>

          </div>
        </motion.div>
        
      </div>
    </section>
  );
}
