import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Recycle, RefreshCw, Trash2, ArrowRight } from 'lucide-react';

export function WasteManagement() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Waste Management Process</h2>
        <p className="text-slate-500">Understanding how construction waste is handled and processed.</p>
      </div>

      {/* Visual Workflow */}
      <Card className="bg-gradient-to-r from-slate-50 to-white">
        <CardContent className="p-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 text-center">Standard Workflow</h3>
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 overflow-x-auto pb-4">
            {['Generate', 'Record', 'Segregate', 'Store', 'Reuse / Recycle', 'Customer Request', 'Pickup', 'Completed'].map((step, idx) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center flex-shrink-0 group hover:-translate-y-1 transition-transform duration-300">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 shadow-sm
                    ${idx < 4 ? 'bg-white text-slate-700 border border-slate-200' : 
                      idx < 7 ? 'bg-primary-50 text-primary-700 border border-primary-200' : 'bg-success-500 text-white shadow-md'}`}
                  >
                    {idx < 9 ? `0${idx + 1}` : idx + 1}
                  </div>
                  <span className="text-xs font-medium text-slate-700 text-center w-16">{step}</span>
                </div>
                {idx < 7 && (
                  <ArrowRight className="w-4 h-4 text-slate-300 hidden md:block flex-shrink-0" />
                )}
                {idx < 7 && (
                  <div className="h-4 w-px bg-slate-300 md:hidden my-1"></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Methods Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-t-4 border-t-primary-500">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                <RefreshCw className="w-5 h-5" />
              </div>
              <CardTitle>Reuse</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Directly using the waste material again for the same or different purpose without significant processing.
            </p>
            <h4 className="font-medium text-slate-800 text-sm mb-2">Common Materials:</h4>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
              <li>Intact Bricks</li>
              <li>Crushed Concrete (as sub-base)</li>
              <li>Excavated Soil</li>
              <li>Untreated Wood</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-success-500">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success-50 rounded-lg text-success-600">
                <Recycle className="w-5 h-5" />
              </div>
              <CardTitle>Recycling</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Processing waste materials into new materials or products, reducing the need for virgin resources.
            </p>
            <h4 className="font-medium text-slate-800 text-sm mb-2">Common Materials:</h4>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
              <li>Steel and Scrap Metal</li>
              <li>Concrete (into aggregate)</li>
              <li>Plastic PVC Pipes</li>
              <li>Glass</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-warning-500">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning-50 rounded-lg text-warning-600">
                <Trash2 className="w-5 h-5" />
              </div>
              <CardTitle>Disposal</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Sending materials that cannot be reused or recycled to authorized landfills. Should be the last resort.
            </p>
            <h4 className="font-medium text-slate-800 text-sm mb-2">Common Materials:</h4>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
              <li>Asbestos / Hazardous Waste</li>
              <li>Heavily Mixed/Contaminated Waste</li>
              <li>Treated Wood (some types)</li>
              <li>Non-recyclable Plastics</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Rule-based recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Methods by Waste Type</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Basic rule-based logic for handling specific materials.</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { type: 'Concrete', method: 'Reuse / Recycling', desc: 'Crush for aggregate base course' },
              { type: 'Steel / Metal', method: 'Recycling', desc: 'Melt and form new steel products' },
              { type: 'Wood', method: 'Reuse / Recycling', desc: 'Reuse in formwork or chip for mulch' },
              { type: 'Soil', method: 'Reuse', desc: 'Use for site grading or landscaping' },
              { type: 'Bricks', method: 'Reuse', desc: 'Clean and reuse in non-structural walls' },
              { type: 'Glass', method: 'Recycling', desc: 'Crush for use in fiberglass or road base' },
              { type: 'Mixed Construction Waste', method: 'Segregation + Disposal', desc: 'Sort recoverable items, dispose the rest' },
            ].map((rule, idx) => (
              <div key={idx} className="flex flex-col p-4 border border-slate-100 rounded-lg bg-slate-50">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-slate-800">{rule.type}</span>
                  <span className="text-xs font-semibold px-2 py-1 bg-white rounded border border-slate-200 text-primary-700">
                    {rule.method}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{rule.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
