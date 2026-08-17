import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DoorClosed,
  DoorOpen,
  Droplets,
  Layers,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Thermometer,
  Truck,
  Wifi,
  Zap
} from 'lucide-react';

// Simulated Telemetry Data Stream
const telemetryHistory = [
  { time: '14:30', temp: 3.8, humidity: 62, light: 12, failureProb: 4 },
  { time: '14:35', temp: 3.9, humidity: 63, light: 10, failureProb: 4 },
  { time: '14:40', temp: 4.1, humidity: 61, light: 11, failureProb: 5 },
  { time: '14:45', temp: 4.0, humidity: 64, light: 12, failureProb: 5 },
  { time: '14:50', temp: 4.3, humidity: 66, light: 15, failureProb: 8 },
  { time: '14:55', temp: 4.8, humidity: 68, light: 14, failureProb: 14 },
  { time: '15:00', temp: 5.2, humidity: 71, light: 12, failureProb: 26 },
  { time: '15:05', temp: 5.9, humidity: 75, light: 420, failureProb: 48 }, // Anomaly: Door open / Temp rise
  { time: '15:10', temp: 5.6, humidity: 73, light: 14, failureProb: 42 },
  { time: '15:15', temp: 5.3, humidity: 70, light: 12, failureProb: 35 },
  { time: '15:20', temp: 4.9, humidity: 67, light: 11, failureProb: 22 },
];

const fleetList = [
  { id: 'TRK-108', route: 'Colombo -> Kandy', status: 'Warning', temp: 5.3, failureRisk: '35%', driver: 'K. Perera', ssid: 'SLT_Mobitel_4G_Hub' },
  { id: 'TRK-204', route: 'Galle -> Negombo', status: 'Healthy', temp: 2.4, failureRisk: '2%', driver: 'A. Silva', ssid: 'Expressway_Depot_North' },
  { id: 'TRK-319', route: 'Jaffna -> Dambulla', status: 'Healthy', temp: 3.1, failureRisk: '4%', driver: 'M. Fernando', ssid: 'Dambulla_Hub_WLAN' },
  { id: 'TRK-402', route: 'Kaduwela DC -> Central', status: 'Critical', temp: 8.7, failureRisk: '89%', driver: 'S. Bandara', ssid: 'DC_Transit_Local' },
];

export default function App() {
  const [selectedTruck, setSelectedTruck] = useState(fleetList[0]);
  const [activeTab, setActiveTab] = useState('telemetry');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Top BI Header */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/80 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="bg-cyan-500/10 text-cyan-400 p-1.5 rounded border border-cyan-500/30">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm tracking-wide text-slate-100">PULSECHAIN</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                BI Control Center
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">Real-Time Cold Chain Predictive Telemetry</p>
          </div>
        </div>

        {/* Global Stats / Sync Info */}
        <div className="flex items-center space-x-6 text-xs font-mono">
          <div className="hidden md:flex items-center space-x-2 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>LAST SYNC: 15:22:30 IST</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-emerald-400 font-semibold">STREAM ACTIVE</span>
          </div>
          <button className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 text-xs transition">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
        
        {/* Left Sidebar: Fleet Table (4 Cols) */}
        <aside className="col-span-12 lg:col-span-3 border-r border-slate-800 bg-slate-900/40 flex flex-col">
          <div className="p-3 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Monitored Fleet ({fleetList.length})</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">SORT: RISK DESC</span>
          </div>

          {/* Quick Search */}
          <div className="p-2 border-b border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Filter unit ID, driver, route..."
                className="w-full bg-slate-950 text-xs pl-8 pr-3 py-1.5 rounded border border-slate-800 focus:outline-none focus:border-cyan-500 font-mono text-slate-300 placeholder-slate-600"
              />
            </div>
          </div>

          {/* Fleet List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 font-mono">
            {fleetList.map((unit) => {
              const isSelected = selectedTruck.id === unit.id;
              const isCrit = unit.status === 'Critical';
              const isWarn = unit.status === 'Warning';

              return (
                <button
                  key={unit.id}
                  onClick={() => setSelectedTruck(unit)}
                  className={`w-full text-left p-3 transition flex flex-col space-y-1.5 ${
                    isSelected ? 'bg-slate-800/90 border-l-2 border-cyan-400' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{unit.id}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                        isCrit
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : isWarn
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {unit.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>{unit.route}</span>
                    <span className="font-semibold text-slate-200">{unit.temp}°C</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                    <span>Drv: {unit.driver}</span>
                    <span className={isCrit ? 'text-rose-400' : isWarn ? 'text-amber-400' : 'text-slate-400'}>
                      Failure Risk: {unit.failureRisk}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Center / Right: Detailed Unit Analytics (9 Cols) */}
        <main className="col-span-12 lg:col-span-9 p-5 flex flex-col space-y-5 overflow-y-auto bg-slate-950">
          
          {/* Unit Banner / Context Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-md p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-lg font-bold text-slate-100 font-mono">{selectedTruck.id}</h2>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  {selectedTruck.route}
                </span>
                <span className="text-xs text-slate-400 font-mono">Driver: {selectedTruck.driver}</span>
              </div>
              <div className="flex items-center space-x-4 mt-2 text-xs font-mono text-slate-400">
                <span className="flex items-center space-x-1">
                  <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                  <span>SSID: <strong className="text-slate-200">{selectedTruck.ssid}</strong></span>
                </span>
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Est. Loc: Sector 4 (In-Transit)</span>
                </span>
              </div>
            </div>

            {/* Predictive Risk Badge */}
            <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded flex items-center space-x-4 font-mono">
              <div>
                <p className="text-[10px] text-slate-500 uppercase">ML Predicted Failure Risk</p>
                <p className="text-xl font-bold text-amber-400">{selectedTruck.failureRisk}</p>
              </div>
              <div className="border-l border-slate-800 pl-4 text-[11px] text-slate-400">
                <p>Confidence: <strong className="text-slate-200">94.2%</strong></p>
                <p>Status: <strong className="text-amber-400">Comp. Stress Detected</strong></p>
              </div>
            </div>
          </div>

          {/* KPI Matrix (4 High-Density Cards) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiTile
              title="CURRENT TEMP"
              value="4.9 °C"
              delta="+0.8°C / 30m"
              deltaType="warn"
              sub="Set Point: 2.0 - 5.0 °C"
              icon={<Thermometer className="w-4 h-4 text-cyan-400" />}
            />
            <KpiTile
              title="CARGO HUMIDITY"
              value="67.4 %"
              delta="+5.4% / 30m"
              deltaType="neutral"
              sub="Optimal: 55 - 70 %"
              icon={<Droplets className="w-4 h-4 text-blue-400" />}
            />
            <KpiTile
              title="CARGO DOOR STATUS"
              value="CLOSED"
              delta="Last open: 15:05 (1m)"
              deltaType="warn"
              sub="Reed Switch: Engaged"
              icon={<DoorClosed className="w-4 h-4 text-emerald-400" />}
            />
            <KpiTile
              title="INTERNAL LIGHT (LUX)"
              value="11 Lux"
              delta="Peak: 420 Lux"
              deltaType="neutral"
              sub="Tamper Threshold: 50 Lux"
              icon={<Activity className="w-4 h-4 text-amber-400" />}
            />
          </div>

          {/* Primary BI Analytics Visualizer */}
          <div className="bg-slate-900 border border-slate-800 rounded-md p-4">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  Telemetry Trend & Failure Probability Correlation
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Synchronized thermal curve, humidity, and real-time inference risk score
                </p>
              </div>
              <div className="flex items-center space-x-4 text-xs font-mono">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-0.5 bg-cyan-400"></span>
                  <span className="text-slate-300">Temp (°C)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-0.5 bg-blue-500"></span>
                  <span className="text-slate-300">Humidity (%)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-0.5 bg-amber-400"></span>
                  <span className="text-slate-300">Risk Prob (%)</span>
                </span>
              </div>
            </div>

            {/* Recharts Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={telemetryHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="probGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                  <Tooltip content={<CustomBiTooltip />} />
                  <Area type="monotone" dataKey="failureProb" stroke="#f59e0b" strokeWidth={1.5} fill="url(#probGrad)" />
                  <Line type="monotone" dataKey="temp" stroke="#22d3ee" strokeWidth={2} dot={{ r: 2, fill: '#22d3ee' }} />
                  <Line type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Event Log & Anomaly Detection Log Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-md p-4 font-mono">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Live Anomaly Audit Trail
              </h3>
              <span className="text-[10px] text-slate-500">AUTO-INGESTION: FASTAPI / SIMULATOR</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                    <th className="py-2 px-3">Timestamp</th>
                    <th className="py-2 px-3">Trigger / Event</th>
                    <th className="py-2 px-3">Sensor Value</th>
                    <th className="py-2 px-3">Risk Assessment</th>
                    <th className="py-2 px-3 text-right">Action State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300 text-[11px]">
                  <tr>
                    <td className="py-2 px-3 text-slate-500">15:05:12</td>
                    <td className="py-2 px-3 text-amber-400 font-semibold">Light Sensor Spike + Door Unlatched</td>
                    <td className="py-2 px-3">420 Lux / Open</td>
                    <td className="py-2 px-3 text-amber-400">Risk elevated to 48%</td>
                    <td className="py-2 px-3 text-right font-semibold text-cyan-400">Flagged</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-500">14:55:04</td>
                    <td className="py-2 px-3 text-slate-300">Compressor Duty Cycle Lag</td>
                    <td className="py-2 px-3">Temp 4.8°C</td>
                    <td className="py-2 px-3 text-slate-400">Thermal delta +0.5°C</td>
                    <td className="py-2 px-3 text-right text-slate-500">Logged</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-500">14:30:00</td>
                    <td className="py-2 px-3 text-slate-300">SSID Handshake Success</td>
                    <td className="py-2 px-3">SLT_Mobitel_4G_Hub</td>
                    <td className="py-2 px-3 text-emerald-400">Nominal</td>
                    <td className="py-2 px-3 text-right text-emerald-400">Verified</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

// KPI Tile Subcomponent
function KpiTile({ title, value, delta, deltaType, sub, icon }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-md p-3.5 flex flex-col justify-between font-mono">
      <div className="flex items-center justify-between text-slate-400">
        <span className="text-[10px] uppercase font-semibold tracking-wider">{title}</span>
        {icon}
      </div>
      <div className="my-2">
        <div className="text-xl font-bold text-slate-100">{value}</div>
        <div className={`text-[10px] font-semibold mt-0.5 ${
          deltaType === 'warn' ? 'text-amber-400' : deltaType === 'crit' ? 'text-rose-400' : 'text-slate-400'
        }`}>
          {delta}
        </div>
      </div>
      <div className="text-[10px] text-slate-500 border-t border-slate-800/80 pt-1.5 truncate">
        {sub}
      </div>
    </div>
  );
}

// Custom Recharts BI Tooltip
function CustomBiTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950 border border-slate-700 p-2.5 rounded shadow-xl font-mono text-xs">
        <p className="text-slate-400 text-[10px] mb-1.5 border-b border-slate-800 pb-1">TIME: {label}</p>
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between space-x-4 py-0.5">
            <span className="text-slate-400 text-[11px] capitalize">{item.name}:</span>
            <span className="font-bold text-slate-200" style={{ color: item.color }}>
              {item.value} {item.name === 'temp' ? '°C' : item.name === 'humidity' ? '%' : '% Prob'}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}