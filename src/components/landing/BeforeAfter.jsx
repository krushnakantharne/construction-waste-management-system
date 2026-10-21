import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, CheckCircle2 } from 'lucide-react';

export function BeforeAfter() {
  const beforePoints = [
    "Untracked waste",
    "Mixed materials in one bin",
    "Unnecessary landfill disposal",
    "Higher environmental impact"
  ];

  const afterPoints = [
    "Digitally recorded waste",
    "Properly segregated materials",
    "Maximized reuse & recycling",
    "Reduced environmental footprint"
  ];

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-slate-900"
          >
            A Transformation in <span className="text-primary-600">Management</span>
          </motion.h2>
        </div>

        <div className="flex flex-col md:flex-row gap-8 relative max-w-5xl mx-auto">
          
          {/* VS Badge */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full items-center justify-center font-bold text-slate-400 shadow-md border border-slate-100 z-10">
            VS
          </div>

          {/* Before */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-3xl p-8 lg:p-12"
          >
            <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-sm">B</span>
              Before
            </h3>
            <div className="space-y-6">
              {beforePoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-slate-400 flex-shrink-0" />
                  <p className="text-slate-600 font-medium">{point}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* After */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 bg-primary-50 border border-primary-100 rounded-3xl p-8 lg:p-12 relative overflow-hidden"
          >
            {/* Subtle glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-400 opacity-10 blur-[80px]" />
            
            <h3 className="text-2xl font-bold text-primary-900 mb-8 flex items-center gap-3 relative z-10">
              <span className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm shadow-md">A</span>
              After
            </h3>
            <div className="space-y-6 relative z-10">
              {afterPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary-600 flex-shrink-0" />
                  <p className="text-primary-900 font-medium">{point}</p>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
