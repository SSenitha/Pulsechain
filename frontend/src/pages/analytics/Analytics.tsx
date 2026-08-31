import { FileText } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/shared/Button";
import { KpiCard } from "@/components/shared/KpiCard";
import { SectionTitle } from "@/components/shared/SectionTitle";

export function Analytics() {
  const dist = [
    { name: "Nominal", value: 8, color: "#4ed69a" },
    { name: "Predicted", value: 2, color: "#f7a94a" },
    { name: "Critical", value: 2, color: "#f06d80" },
  ];
  return (
    <>
      <SectionTitle
        eyebrow="SIGNAL INTELLIGENCE / 24H WINDOW"
        title="Analytics"
        action={
          <Button testId="button-export-analytics">
            <FileText size={14} /> Export audit
          </Button>
        }
      />

      {/* KPI CARDS - Have to make dynamic*/}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          name="Risk index"
          value="32.6"
          note="−4.8% vs prior window"
          accent="orange"
        />
        <KpiCard
          name="Anomalies"
          value="17"
          note="5 open · 12 resolved"
          accent="rose"
        />
        <KpiCard
          name="Mean recovery"
          value="18m"
          note="from excursion onset"
          accent="emerald"
        />
        <KpiCard
          name="Signal coverage"
          value="98.4%"
          note="all channels reporting"
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_.75fr]">

        <section className="panel p-5">
          <div className="mb-5">
            <div className="font-mono text-[10px] tracking-[.16em] text-cyan-400">
              CORRELATION MATRIX
            </div>
            <div className="mt-1 text-sm text-slate-200">
              Signal to risk relationship
            </div>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={correlation}
                layout="vertical"
                margin={{ left: 20, right: 20 }}
              >
                <CartesianGrid horizontal={false} stroke="#1c3440" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fill: "#647d86", fontSize: 9, fontFamily: "DM Mono" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={82}
                  tick={{ fill: "#a5b5b9", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Bar dataKey="risk" fill="#57e0e5" barSize={14} radius={0} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel p-5">
          <div className="font-mono text-[10px] tracking-[.16em] text-cyan-400">
            RISK DISTRIBUTION
          </div>
          <div className="mt-1 text-sm text-slate-200">
            Current asset population
          </div>
          <div className="relative mx-auto mt-5 h-[190px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dist}
                  dataKey="value"
                  innerRadius={58}
                  outerRadius={83}
                  paddingAngle={3}
                  stroke="none"
                >
                  {dist.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#0b1a22",
                    border: "1px solid #284451",
                    fontSize: 11,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className="font-mono text-2xl text-slate-100">12</div>
                <div className="font-mono text-[9px] text-slate-600">
                  ASSETS
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {dist.map((item) => (
              <div
                className="flex items-center justify-between text-xs"
                key={item.name}
              >
                <span className="flex items-center gap-2 text-slate-400">
                  <span
                    className="status-dot"
                    style={{ background: item.color }}
                  />
                  {item.name}
                </span>
                <span className="font-mono text-slate-200">{item.value}</span>
              </div>
            ))}
          </div>

        </section>

      </div>

      <section className="panel mt-5">
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div>
            <div className="font-mono text-[10px] tracking-[.16em] text-cyan-400">
              AUDIT TRAIL / LIVE
            </div>
            <div className="mt-1 text-sm text-slate-200">
              Anomaly event stream
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-emerald-300">
            <span className="status-dot bg-emerald-400 pulse-line" />
            UPDATING
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="font-mono text-[9px] tracking-[.1em] text-slate-600">
              <tr>
                <th className="p-4 font-normal">TIME</th>
                <th className="p-4 font-normal">EVENT</th>
                <th className="p-4 font-normal">ASSET</th>
                <th className="p-4 font-normal">OBSERVATION</th>
                <th className="p-4 font-normal">STATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {audit.map(([time, id, asset, observation, state]) => (
                <tr
                  key={id}
                  className="text-xs hover:bg-cyan-300/[.03]"
                  data-testid={`row-anomaly-${id}`}
                >
                  <td className="p-4 font-mono text-slate-500">{time}</td>
                  <td className="p-4 font-mono text-cyan-300">{id}</td>
                  <td className="p-4 font-mono text-slate-300">{asset}</td>
                  <td className="p-4 text-slate-400">{observation}</td>
                  <td className="p-4">
                    <span
                      className={`font-mono text-[9px] ${state === "CRITICAL" ? "text-rose-300" : state === "AMBER" ? "text-orange-300" : "text-emerald-300"}`}
                    >
                      {state}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

// MOCK DATA
const correlation = [
  { name: "Temp drift", risk: 78 },
  { name: "Door cycles", risk: 64 },
  { name: "Humidity", risk: 41 },
  { name: "Lux exposure", risk: 29 },
  { name: "Latency", risk: 18 },
];
const audit = [
  [
    "10:42:18",
    "ANOM-2281",
    "TRK-103",
    "Temperature crossed 8°C boundary",
    "CRITICAL",
  ],
  [
    "10:38:04",
    "ANOM-2278",
    "TRK-108",
    "Door seal state changed while moving",
    "CRITICAL",
  ],
  [
    "10:17:55",
    "ANOM-2274",
    "TRK-109",
    "Humidity trend above route baseline",
    "AMBER",
  ],
  [
    "09:51:40",
    "ANOM-2269",
    "TRK-105",
    "Predicted excursion in 44 minutes",
    "AMBER",
  ],
  [
    "09:14:22",
    "ANOM-2262",
    "TRK-101",
    "Node handoff latency normalized",
    "CLOSED",
  ],
];
