import React from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AlertCircle, TrendingDown, MessageSquare, Target, CheckCircle } from 'lucide-react';

const RichSlidePreview = ({ data }) => {
  if (!data || !data.blocks) return (
      <div className="bg-white p-10 rounded-xl shadow-lg text-center text-gray-400">
          Generating Insight Dashboard...
      </div>
  );

  const { actionTitle, subtitle, blocks } = data;

  const renderBlock = (block, idx) => {
      const colors = ['bg-red-600', 'bg-orange-600', 'bg-amber-600', 'bg-blue-900', 'bg-emerald-600'];
      const lightBgs = ['bg-red-50', 'bg-orange-50', 'bg-amber-50', 'bg-blue-50', 'bg-emerald-50'];
      const borderColors = ['border-red-600', 'border-orange-600', 'border-amber-600', 'border-blue-900', 'border-emerald-600'];
      const textColors = ['text-red-700', 'text-orange-700', 'text-amber-700', 'text-blue-900', 'text-emerald-700'];

      const color = block.chartData?.datasets?.[0]?.color || colors[idx % colors.length].replace('bg-', '#'); // Helper hack
      const themeIdx = idx % colors.length;

      // Prepare Data
      let chartData = [];
      if (block.chartData) {
          chartData = block.chartData.labels.map((l, i) => ({
              name: l,
              value: block.chartData.datasets[0].data[i]
          }));
      }

      return (
          <div key={idx} className={`bg-gradient-to-br from-white to-gray-50/50 border-l-4 ${borderColors[themeIdx]} p-5 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col h-64`}>
              {/* Header */}
              <div className="flex items-start mb-3">
                  <div className={`${colors[themeIdx]} rounded-full p-1.5 mr-3 flex-shrink-0 mt-0.5 shadow-sm`}>
                     {idx === 0 && <AlertCircle className="w-3.5 h-3.5 text-white" />}
                     {idx === 1 && <TrendingDown className="w-3.5 h-3.5 text-white" />}
                     {idx === 2 && <MessageSquare className="w-3.5 h-3.5 text-white" />}
                     {idx === 3 && <Target className="w-3.5 h-3.5 text-white" />}
                     {idx > 3 && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div>
                      <h3 className="text-sm font-bold text-gray-800 leading-tight">{block.title}</h3>
                      <p className="text-[10px] text-gray-500 mt-1 leading-snug line-clamp-2">{block.description}</p>
                  </div>
              </div>

              {/* Chart/Metric Area */}
              <div className="flex-1 min-h-0 relative">
                  {(block.type === 'CHART_AREA' || block.type === 'CHART_LINE') && (
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                              <defs>
                                <linearGradient id={`grad${idx}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                              <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} dy={5} />
                              <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                              <Tooltip contentStyle={{ fontSize: '10px' }} />
                              <Area type="monotone" dataKey="value" stroke={color} fill={`url(#grad${idx})`} strokeWidth={2} />
                          </AreaChart>
                      </ResponsiveContainer>
                  )}
                  {block.type === 'CHART_BAR' && (
                       <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                               <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} dy={5} />
                               <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                              <Tooltip contentStyle={{ fontSize: '10px' }} />
                              <Bar dataKey="value" fill={color} radius={[3, 3, 0, 0]} />
                          </BarChart>
                       </ResponsiveContainer>
                  )}
                  {block.type === 'METRIC_CARD' && (
                      <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                              <div className={`text-4xl font-bold ${textColors[themeIdx]}`}>{block.metric?.value}</div>
                              <div className="text-xs text-gray-500 uppercase tracking-widest mt-1 font-semibold">{block.metric?.label}</div>
                          </div>
                      </div>
                  )}
              </div>

              {/* Footer Metric */}
              {block.metric && block.type !== 'METRIC_CARD' && (
                   <div className={`text-[10px] ${textColors[themeIdx]} font-bold mt-2 flex items-center gap-1`}>
                       {block.metric.trend === 'up' ? '↗' : '↘'} {block.metric.value} {block.metric.label}
                   </div>
              )}
          </div>
      );
  }

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-white shadow-xl transition-all duration-300 hover:shadow-2xl border border-white/50 ring-1 ring-gray-100 w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white px-8 py-6 border-b-4 border-primary/10 relative">
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-orange-500 to-blue-900" />
          <div className="flex justify-between items-end">
              <div>
                  <h2 className="text-2xl font-display font-bold text-navy leading-tight">{actionTitle}</h2>
                  <p className="text-sm text-gray-500 italic mt-1">{subtitle}</p>
              </div>
              <div className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                  Project C Analysis
              </div>
          </div>
      </div>

      {/* Grid Content */}
      <div className="p-6 bg-gray-50/30">
        <div className="grid grid-cols-2 gap-5">
            {blocks.map((block, i) => renderBlock(block, i))}
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-8 py-3 bg-white border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-medium">
        <span>Strategic Assessment • Confidential</span>
        <span>Generated by Project C</span>
      </div>
    </div>
  );
};

export default RichSlidePreview;
