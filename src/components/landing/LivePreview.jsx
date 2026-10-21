import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3 } from 'lucide-react';
import { Button } from '../ui/Button';

export function LivePreview() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-slate-50 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          <div className="w-full lg:w-1/2">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight"
            >
              A Clear View of <br />
              <span className="text-primary-600">What Happens on Site.</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-500 mb-8"
            >
              Monitor site metrics in real-time. Make informed decisions instantly with our intuitive dashboard designed specifically for construction environments.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link to="/dashboard">
                <Button size="lg" className="gap-2">
                  Explore Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          </div>

          <div className="w-full lg:w-1/2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, rotateY: 10 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="bg-white border border-slate-200 p-6 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] relative"
              style={{ perspective: 1000 }}
            >
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-800">Site Performance</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: 'Total Waste', value: '12.5 T', color: 'text-slate-800' },
                  { label: 'Reused', value: '4.2 T', color: 'text-primary-600' },
                  { label: 'Recycled', value: '5.8 T', color: 'text-success-600' },
                  { label: 'Disposed', value: '2.5 T', color: 'text-warning-600' },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Animated dummy chart */}
              <div className="h-32 bg-slate-50 rounded-xl border border-slate-100 p-4 flex items-end gap-2 overflow-hidden">
                {[40, 70, 45, 90, 65, 85, 30].map((height, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${height}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: i * 0.1, type: 'spring' }}
                    className="flex-1 bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-sm"
                  />
                ))}
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
