import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

export function ImpactSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const impacts = [
    { value: 68, suffix: '%', label: 'Waste Recovery', icon: '♻️' },
    { value: 5.8, suffix: ' T', label: 'Material Recycled', icon: '🏗️', decimals: 1 },
    { value: 4.2, suffix: ' T', label: 'Material Reused', icon: '🌱', decimals: 1 },
    { value: 12.5, suffix: ' T', label: 'Waste Tracked', icon: '📊', decimals: 1 },
  ];

  return (
    <section className="py-24 bg-slate-900 text-white relative">
      <div className="absolute inset-0 bg-primary-900/20 mix-blend-multiply" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Measure More Than Waste. <span className="text-primary-400">Measure Impact.</span></h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-16 text-lg">
            (Sample Data) What gets measured gets managed. See the direct environmental impact of proper construction waste management.
          </p>
        </motion.div>

        <div ref={ref} className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {impacts.map((impact, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col items-center p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm"
            >
              <span className="text-4xl mb-4">{impact.icon}</span>
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2 flex items-center">
                {inView ? (
                  <CountUp 
                    end={impact.value} 
                    decimals={impact.decimals || 0}
                    duration={2.5}
                  />
                ) : '0'}
                <span>{impact.suffix}</span>
              </div>
              <span className="text-sm font-medium text-slate-400 uppercase tracking-wide">{impact.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
