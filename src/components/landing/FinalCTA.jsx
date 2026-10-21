import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export function FinalCTA() {
  return (
    <section className="relative py-32 bg-slate-900 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-600 rounded-full blur-[150px] mix-blend-screen opacity-50" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-success-600 rounded-full blur-[150px] mix-blend-screen opacity-30" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-slate-800/40 backdrop-blur-xl border border-white/10 p-12 md:p-16 rounded-3xl"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Build Better. <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-success-400">Waste Less.</span>
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Bring construction waste management into one simple digital system. Start tracking your environmental impact today.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard">
              <Button size="lg" className="w-full sm:w-auto px-8 py-4 text-base shadow-xl shadow-primary-900/20">
                Explore Dashboard
              </Button>
            </Link>
            <Link to="/add-waste">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto px-8 py-4 text-base text-slate-200 hover:text-white border border-slate-600 hover:bg-slate-700">
                Start Recording Waste
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
