import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Activity, LayoutDashboard, PlusCircle, Recycle, Trash2 } from 'lucide-react';
import { cn } from '../../utils/formatting';

const journeySteps = [
  { id: '01', title: 'Generate', desc: 'Waste produced at site', icon: Activity, detail: 'Construction material transitions into waste generation through standard site activities.' },
  { id: '02', title: 'Record', desc: 'Digital entry created', icon: PlusCircle, detail: 'Waste is immediately logged into the digital system via the Add Record interface.' },
  { id: '03', title: 'Segregate', desc: 'Sorted by category', icon: LayoutDashboard, detail: 'Mixed waste is categorized (e.g. Concrete, Steel, Wood) for optimal handling.' },
  { id: '04', title: 'Reuse / Recycle', desc: 'Resource recovery', icon: Recycle, detail: 'Materials are routed to their most sustainable outcome, closing the loop.' },
  { id: '05', title: 'Dispose Responsibly', desc: 'Final destination', icon: Trash2, detail: 'Only non-recoverable materials are routed to authorized landfills.' },
];

export function JourneySection() {
  const containerRef = useRef(null);
  
  // Track scroll progress within this section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  return (
    <section id="how-it-works" ref={containerRef} className="py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight"
          >
            Observe. Understand. <span className="text-primary-600">Manage.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-500"
          >
            A seamless digital journey from waste generation to final resolution.
          </motion.p>
        </div>

        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-slate-200 -translate-x-1/2" />
          
          <motion.div 
            className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-primary-500 -translate-x-1/2 origin-top"
            style={{ scaleY: scrollYProgress }}
          />

          <div className="space-y-24 relative z-10">
            {journeySteps.map((step, idx) => {
              const isEven = idx % 2 === 0;
              const Icon = step.icon;
              
              // We want to highlight the step as the scroll reaches it
              // This is a simplified approach. In a real highly-complex site, 
              // we'd map scrollYProgress to specific active indexes.
              
              return (
                <motion.div 
                  key={step.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, margin: "-20%" }}
                  transition={{ duration: 0.5 }}
                  className={cn(
                    "flex flex-col md:flex-row items-center gap-8 md:gap-0",
                    isEven ? "md:flex-row-reverse" : ""
                  )}
                >
                  {/* Content Half */}
                  <div className={cn("w-full md:w-1/2 pl-20 md:pl-0", isEven ? "md:pr-20 text-left md:text-right" : "md:pl-20 text-left")}>
                    <div className="inline-block text-primary-600 font-bold text-lg mb-2">{step.id}</div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{step.title}</h3>
                    <p className="text-slate-500 mb-4">{step.desc}</p>
                    <p className="text-slate-600 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">{step.detail}</p>
                  </div>

                  {/* Center Node */}
                  <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center shadow-lg transition-colors duration-500 z-20">
                    <motion.div
                      whileInView={{ scale: [0.8, 1.2, 1], color: '#3b82f6' }}
                      viewport={{ once: false, margin: "-20%" }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className="w-6 h-6 text-slate-400" />
                    </motion.div>
                  </div>

                  {/* Empty Half for layout balance */}
                  <div className="hidden md:block w-1/2" />
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
