import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Layers, Recycle, Zap } from 'lucide-react';

export function Benefits() {
  const benefits = [
    {
      title: "Better Tracking",
      desc: "Know exactly how much waste is being generated, when, and where. Eliminate guesswork with real-time digital logging.",
      icon: BarChart2
    },
    {
      title: "Better Segregation",
      desc: "Identify and isolate different construction waste categories efficiently on-site before they become mixed and unrecoverable.",
      icon: Layers
    },
    {
      title: "Better Recovery",
      desc: "Identify materials suitable for reuse or recycling. Divert valuable resources away from costly landfill disposal.",
      icon: Recycle
    },
    {
      title: "Better Decisions",
      desc: "Use collected data to improve waste management strategies for future projects. Turn insights into sustainable action.",
      icon: Zap
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
  };

  return (
    <section className="py-24 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
          >
            Why Implement This System?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600"
          >
            Move beyond manual logs and messy spreadsheets. A unified digital approach provides compounding benefits for your site.
          </motion.p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {benefits.map((benefit, idx) => (
            <motion.div 
              key={idx}
              variants={itemVariants}
              className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                <benefit.icon className="w-6 h-6 text-slate-500 group-hover:text-primary-600 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{benefit.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                {benefit.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
