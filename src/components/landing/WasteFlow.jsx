import React from 'react';
import { motion } from 'framer-motion';

export function WasteFlow() {
  const flowNodes = [
    { id: 1, label: 'Construction Activity', x: '10%', y: '20%' },
    { id: 2, label: 'Waste Generated', x: '30%', y: '50%' },
    { id: 3, label: 'Segregation', x: '50%', y: '20%' },
    { id: 4, label: 'Storage', x: '50%', y: '80%' },
    { id: 5, label: 'Reuse', x: '70%', y: '20%' },
    { id: 6, label: 'Recycling', x: '85%', y: '50%' },
    { id: 7, label: 'Disposal', x: '70%', y: '80%' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const nodeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring' } }
  };

  return (
    <section className="py-24 bg-slate-50 overflow-hidden hidden lg:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            From Waste Generation <br />
            <span className="text-slate-500">To Resource Recovery</span>
          </h2>
        </div>

        <motion.div 
          className="relative w-full h-[500px] bg-white rounded-3xl border border-slate-200 shadow-sm p-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Draw lines (simplified CSS-based connecting paths could go here in a real implementation, 
              for now we'll rely on the scattered nodes creating a visual flow) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            {/* Generating simple bezier curves between points would normally require complex math in React,
                so we use abstract straight dashed lines for a tech feel */}
            <motion.path 
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              viewport={{ once: true }}
              d="M 10% 20% L 30% 50% L 50% 20% L 70% 20% L 85% 50%" 
              stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5,5" fill="none" 
            />
            <motion.path 
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              viewport={{ once: true }}
              d="M 30% 50% L 50% 80% L 70% 80%" 
              stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5,5" fill="none" 
            />
            <motion.path 
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              viewport={{ once: true }}
              d="M 50% 20% L 85% 50%" 
              stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5,5" fill="none" 
            />
          </svg>

          {flowNodes.map((node) => (
            <motion.div
              key={node.id}
              variants={nodeVariants}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{ left: node.x, top: node.y }}
            >
              <div className="bg-white border border-slate-200 px-6 py-3 rounded-xl shadow-md text-sm font-semibold text-slate-700 whitespace-nowrap">
                {node.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
