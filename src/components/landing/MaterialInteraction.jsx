import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const materials = [
  { id: 'concrete', name: 'Concrete', source: 'Demolition, Structural works', action: 'Reuse / Recycle', destination: 'Road sub-base, Aggregate', color: 'bg-slate-700' },
  { id: 'bricks', name: 'Bricks', source: 'Wall dismantling', action: 'Reuse', destination: 'Non-structural walls, Landscaping', color: 'bg-red-700' },
  { id: 'steel', name: 'Steel', source: 'Reinforcement, Beams', action: 'Recycle', destination: 'Foundries for melting', color: 'bg-slate-500' },
  { id: 'wood', name: 'Wood', source: 'Formwork, Scaffolding', action: 'Reuse / Recycle', destination: 'Secondary formwork, Mulch', color: 'bg-amber-700' },
  { id: 'plastic', name: 'Plastic', source: 'Packaging, Pipes', action: 'Recycle', destination: 'Plastic manufacturing', color: 'bg-blue-600' },
  { id: 'soil', name: 'Soil', source: 'Excavation', action: 'Reuse', destination: 'Site grading, Backfilling', color: 'bg-emerald-800' },
];

export function MaterialInteraction() {
  const [activeMaterial, setActiveMaterial] = useState(materials[0]);

  return (
    <section id="materials" className="py-32 bg-slate-950 text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-slate-950 opacity-80" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6 tracking-tight"
          >
            Every Material <br className="hidden sm:block" />
            <span className="text-slate-400">Has a Next Step.</span>
          </motion.h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left: Material List */}
          <div className="w-full lg:w-1/3 flex flex-col gap-3">
            {materials.map((mat) => (
              <button
                key={mat.id}
                onClick={() => setActiveMaterial(mat)}
                className={`text-left px-6 py-4 rounded-xl transition-all duration-300 ${
                  activeMaterial.id === mat.id 
                    ? 'bg-white/10 border border-white/20 shadow-lg' 
                    : 'hover:bg-white/5 border border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <span className="text-xl font-semibold tracking-wide">{mat.name}</span>
              </button>
            ))}
          </div>

          {/* Right: Interactive Display */}
          <div className="w-full lg:w-2/3 relative h-[400px] sm:h-[500px] rounded-3xl overflow-hidden border border-white/10 bg-slate-900/50 backdrop-blur-sm p-8 sm:p-12 flex flex-col justify-between">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMaterial.id}
                initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                transition={{ duration: 0.4 }}
                className="h-full flex flex-col"
              >
                {/* Visual Representation Graphic */}
                <div className={`w-24 h-24 rounded-2xl mb-12 shadow-2xl ${activeMaterial.color} flex items-center justify-center text-4xl font-bold`}>
                  {activeMaterial.name.charAt(0)}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-auto">
                  
                  <div>
                    <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Typical Source</div>
                    <div className="text-lg text-slate-200">{activeMaterial.source}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Recommended Action</div>
                    <div className="text-lg text-primary-400 font-medium flex items-center gap-2">
                      {activeMaterial.action}
                    </div>
                  </div>

                  <div className="sm:col-span-2 pt-6 border-t border-white/10">
                    <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Potential Destination</div>
                    <div className="text-xl text-white">{activeMaterial.destination}</div>
                  </div>
                  
                </div>
              </motion.div>
            </AnimatePresence>
            
          </div>

        </div>
      </div>
    </section>
  );
}
