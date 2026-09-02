import { useState, useEffect } from "react";
import { AlertOctagon, RefreshCw, Wifi, Truck, X, ThermometerSun, Droplets, Zap, Shield, Clock, MapPin } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/shared/Button";
import { KpiCard } from "@/components/shared/KpiCard";
import { SearchBox } from "@/components/shared/SearchBox";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { metric } from "@/components/layout/Shell";
import { useApp } from "@/context/AppContext";
import { SectionTitle } from "@/components/shared/SectionTitle";
import type { Truck as TruckType } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────
const TEMP_MAX = 8;   // °C upper limit
const TEMP_MIN = 2;   // °C lower limit
const RH_MAX = 65;    // % upper humidity limit

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded border border-slate-700 bg-[#071218] px-3 py-2.5 shadow-xl">
      <div className="mb-2 text-xs text-slate-500 font-mono">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-3 text-sm">
          <span style={{ color: p.stroke }} className="text-base leading-none">■</span>
          <span className="text-slate-300">{p.dataKey === "temp" ? "Temperature" : "Humidity"}</span>
          <span className="ml-auto font-semibold font-mono" style={{ color: p.stroke }}>
            {p.value?.toFixed(1)}{p.dataKey === "temp" ? " °C" : "%"}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Truck Detail Modal ───────────────────────────────────────────────────────
function TruckModal({ truck, onClose }: { truck: TruckType; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const chart = Array.from({ length: 18 }, (_, i) => ({
    time: `${String(8 + Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`,
    temp:
      (truck.temp || 4) +
      Math.sin(i * 0.72) * 0.7 +
      (truck.health === "critical" ? i * 0.07 : 0),
    humidity: (truck.humidity || 44) + Math.cos(i * 0.45) * 3,
  }));

  const isCritical = truck.health === "critical";
  const isAmber = truck.health === "amber";
  const accentColor = isCritical ? "#f87171" : isAmber ? "#fb923c" : "#34d399";
  const accentBg = isCritical ? "bg-rose-400/10 border-rose-400/30" : isAmber ? "bg-amber-400/10 border-amber-400/30" : "bg-emerald-400/10 border-emerald-400/30";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(4, 10, 14, 0.88)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      data-testid="modal-truck-detail"
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden border border-slate-700/80 bg-[#0b1a22] shadow-2xl"
        style={{ animation: "slideUp .18s ease-out" }}
      >
        {/* Modal Header */}
        <div className={`flex items-center justify-between border-b px-5 py-4 ${isCritical ? "border-rose-500/40" : isAmber ? "border-amber-500/40" : "border-slate-700"}`}>
          <div className="flex items-center gap-3">
            <div className={`grid h-8 w-8 place-items-center border ${accentBg}`}>
              <Truck size={15} style={{ color: accentColor }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-semibold text-slate-100">{truck.id}</span>
                <StatusBadge health={truck.health} />
              </div>
              <div className="mt-1 text-sm text-slate-400">
                {truck.driver} &middot; {truck.route} &middot; ETA {truck.eta}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-2 py-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[11px] font-medium text-emerald-400">Live</span>
            </div>
            <button
              onClick={onClose}
              className="grid h-7 w-7 place-items-center border border-slate-700 text-slate-500 transition-colors hover:border-slate-500 hover:text-slate-200"
              data-testid="button-close-modal"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* Metric bar */}
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className={`border p-4 ${isCritical ? "border-rose-400/40 bg-rose-400/[.07]" : "border-slate-700/60 bg-slate-800/30"}`}>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                <ThermometerSun size={12} /> Temperature
              </div>
              <div className={`mt-2 text-3xl font-semibold tracking-tight ${isCritical ? "text-rose-300" : isAmber ? "text-amber-300" : "text-cyan-300"}`}>
                {truck.temp.toFixed(1)}°
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Limit {TEMP_MIN}–{TEMP_MAX} °C
              </div>
            </div>

            <div className="border border-slate-700/60 bg-slate-800/30 p-4">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                <Droplets size={12} /> Humidity
              </div>
              <div className={`mt-2 text-3xl font-semibold tracking-tight ${truck.humidity > RH_MAX ? "text-amber-300" : "text-slate-200"}`}>
                {truck.humidity}%
              </div>
              <div className="mt-1 text-xs text-slate-500">Max {RH_MAX}% RH</div>
            </div>

            <div className="border border-slate-700/60 bg-slate-800/30 p-4">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                <Zap size={12} /> Ambient Light
              </div>
              <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-200">{truck.lux}</div>
              <div className="mt-1 text-xs text-slate-500">Lux reading</div>
            </div>

            <div className={`border p-4 ${truck.risk > 70 ? "border-rose-400/40 bg-rose-400/[.07]" : truck.risk > 40 ? "border-amber-400/40 bg-amber-400/[.07]" : "border-slate-700/60 bg-slate-800/30"}`}>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                <Shield size={12} /> Risk Score
              </div>
              <div className={`mt-2 text-3xl font-semibold tracking-tight ${truck.risk > 70 ? "text-rose-300" : truck.risk > 40 ? "text-amber-300" : "text-emerald-300"}`}>
                {truck.risk}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {truck.risk > 70 ? "Critical threshold" : truck.risk > 40 ? "Amber threshold" : "Within safe bounds"}
              </div>
            </div>
          </div>

          {/* Status row */}
          <div className="mb-5 flex flex-wrap gap-2">
            <div className="flex items-center gap-2 border border-slate-700/60 bg-slate-800/30 px-3 py-2 rounded-sm">
              <div className={`h-2 w-2 rounded-full ${truck.door === "OPEN" ? "bg-rose-400 animate-pulse" : "bg-emerald-400"}`} />
              <span className="text-xs text-slate-500">Door</span>
              <span className={`text-xs font-semibold ${truck.door === "OPEN" ? "text-rose-300" : "text-emerald-300"}`}>{truck.door === "OPEN" ? "Open" : "Sealed"}</span>
            </div>
            <div className="flex items-center gap-2 border border-slate-700/60 bg-slate-800/30 px-3 py-2 rounded-sm">
              <MapPin size={12} className="text-slate-500" />
              <span className="text-xs text-slate-500">Node</span>
              <span className="text-xs text-cyan-300 font-mono">{truck.ssid}</span>
            </div>
            <div className="flex items-center gap-2 border border-slate-700/60 bg-slate-800/30 px-3 py-2 rounded-sm">
              <Clock size={12} className="text-slate-500" />
              <span className="text-xs text-slate-500">Last seen</span>
              <span className="text-xs text-slate-300">{truck.lastSeen}</span>
            </div>
            <div className="flex items-center gap-2 border border-slate-700/60 bg-slate-800/30 px-3 py-2 rounded-sm">
              <span className="text-xs text-slate-500">Destination</span>
              <span className="text-xs text-slate-200">{truck.destination}</span>
            </div>
          </div>

          {/* Telemetry Chart */}
          <div className="border border-slate-700/60 bg-[#071218] p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Telemetry · 9 hr window</div>
                <div className="mt-0.5 text-sm font-medium text-slate-200">Thermal profile</div>
              </div>
              <div className="flex flex-wrap gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <span className="inline-block h-px w-4 border-t-2 border-cyan-400" />Temp °C
                </span>
                <span className="flex items-center gap-1.5 text-orange-300">
                  <span className="inline-block h-px w-4 border-t-2 border-orange-400" />RH %
                </span>
                <span className="flex items-center gap-1.5 text-rose-400/80">
                  <span className="inline-block h-px w-4 border-t-2 border-dashed border-rose-400" />Limit
                </span>
              </div>
            </div>

            <div className="h-[240px] w-full" data-testid={`chart-telemetry-${truck.id}`}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="#1c3440" strokeDasharray="2 6" />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: "#8fa8b5", fontSize: 11, fontFamily: "DM Mono" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="temp"
                    tick={{ fill: "#8fa8b5", fontSize: 11, fontFamily: "DM Mono" }}
                    tickLine={false}
                    axisLine={false}
                    width={32}
                  />
                  <YAxis
                    yAxisId="rh"
                    orientation="right"
                    tick={{ fill: "#8fa8b5", fontSize: 11, fontFamily: "DM Mono" }}
                    tickLine={false}
                    axisLine={false}
                    width={32}
                  />
                  <Tooltip content={<ChartTooltip />} />

                  <ReferenceLine
                    yAxisId="temp"
                    y={TEMP_MAX}
                    stroke="#f87171"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{ value: `Max ${TEMP_MAX}°C`, position: "insideTopRight", fill: "#f87171", fontSize: 11, fontFamily: "DM Mono" }}
                  />
                  <ReferenceLine
                    yAxisId="temp"
                    y={TEMP_MIN}
                    stroke="#60a5fa"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{ value: `Min ${TEMP_MIN}°C`, position: "insideBottomRight", fill: "#60a5fa", fontSize: 11, fontFamily: "DM Mono" }}
                  />
                  <ReferenceLine
                    yAxisId="rh"
                    y={RH_MAX}
                    stroke="#fb923c"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{ value: `Max ${RH_MAX}%`, position: "insideTopLeft", fill: "#fb923c", fontSize: 11, fontFamily: "DM Mono" }}
                  />

                  <Line
                    yAxisId="temp"
                    type="monotone"
                    dataKey="temp"
                    stroke="#57e0e5"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 3, fill: "#57e0e5" }}
                  />
                  <Line
                    yAxisId="rh"
                    type="monotone"
                    dataKey="humidity"
                    stroke="#f7a94a"
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 3, fill: "#f7a94a" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Handshake log */}
          <div className="mt-4 border border-slate-700/60 bg-[#071218] p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Handshake Log</div>
                <div className="mt-0.5 text-sm font-medium text-slate-200">SSID node links</div>
              </div>
              <Wifi size={14} className="text-cyan-300" />
            </div>
            <div className="space-y-3">
              {[
                ["08:42:10", "PCG-EDGE-04", "-62 dBm", "VERIFIED"],
                ["08:41:55", "PCG-EDGE-04", "-61 dBm", "VERIFIED"],
                ["08:39:10", "PCG-EDGE-03", "-71 dBm", "ROAMED"],
                ["08:24:42", "PCG-EDGE-03", "-69 dBm", "VERIFIED"],
              ].map(([time, node, signal, status], i) => (
                <div
                  key={time + node}
                  className="flex items-center gap-4 py-1.5 text-sm border-b border-slate-800/60 last:border-0"
                  data-testid={`row-handshake-${i}`}
                >
                  <span className="font-mono text-xs text-slate-500 w-20 shrink-0">{time}</span>
                  <span className="text-cyan-300 font-medium">{node}</span>
                  <span className="text-slate-400 font-mono text-xs">{signal}</span>
                  <span className={`ml-auto text-xs font-semibold ${status === "ROAMED" ? "text-orange-300" : "text-emerald-300"}`}>
                    {status === "ROAMED" ? "Roamed" : "Verified"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export function Fleet() {
  const { trucks } = useApp();
  const [filter, setFilter] = useState<"all" | "critical" | "amber">("all");
  const [query, setQuery] = useState("");
  const [modalTruck, setModalTruck] = useState<TruckType | null>(null);

  const visible = trucks.filter(
    (truck) =>
      (filter === "all" || truck.health === filter) &&
      `${truck.id} ${truck.driver} ${truck.route} ${truck.destination}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );

  return (
    <>
      <SectionTitle
        eyebrow="PRIORITY MONITOR / FLEET"
        title="Fleet Command"
        action={
          <div className="flex gap-2">
            <Button
              onClick={() => window.location.reload()}
              testId="button-refresh-fleet"
            >
              <RefreshCw size={14} /> Refresh feed
            </Button>
            <Button
              variant="primary"
              onClick={() => setFilter(filter === "critical" ? "all" : "critical")}
              testId="button-focus-critical"
            >
              <AlertOctagon size={14} /> {filter === "critical" ? "Show all" : "Focus critical"}
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          name="Assets monitored"
          value={String(trucks.length)}
          note="12 / 12 reporting"
        />
        <KpiCard
          name="Nominal now"
          value={String(trucks.filter((t) => t.health === "nominal").length)}
          note="within operating band"
          accent="emerald"
        />
        <KpiCard
          name="Priority events"
          value="02"
          note="1 critical · 1 amber"
          accent="orange"
        />
        <KpiCard name="Avg telemetry lag" value="4.8s" note="last 15 minutes" />
      </div>

      <hr className="border-slate-800 pb-5"></hr>

      {/* Fleet grid (full width now — no side panel) */}
      <section className="panel min-w-0 reveal-2">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 p-4">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wide">
              Active fleet &mdash; {visible.length.toString().padStart(2, "0")} assets
              {filter !== "all" && (
                <button
                  onClick={() => setFilter("all")}
                  className="ml-3 text-cyan-400 hover:text-cyan-200"
                >
                  · Clear filter ×
                </button>
              )}
            </div>
            <div className="mt-1 text-base font-semibold text-slate-100">
              Live vehicle grid{" "}
              <span className="text-slate-500 text-sm font-normal">— click a card to inspect</span>
            </div>
          </div>
          <SearchBox
            value={query}
            onChange={setQuery}
            placeholder="Search ID, driver, route"
            testId="input-fleet-search"
          />
        </div>

        {/* Cards — expanded to fill width */}
        <div className="grid gap-px bg-slate-800/70 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((item) => (
            <button
              onClick={() => setModalTruck(item)}
              key={item.id}
              className={`
                group panel-hover p-4 text-left transition-all duration-150
                ${item.health === "critical"
                  ? "bg-rose-400/10 border-rose-400/50 hover:bg-rose-400/[.15]"
                  : item.health === "amber"
                  ? "bg-amber-400/10 border-orange-400/50 hover:bg-amber-400/[.15]"
                  : "bg-[#0b1a22] border-slate-800/50 hover:bg-slate-700/20"
                }
              `}
              data-testid={`card-truck-${item.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Truck
                    size={15}
                    className={item.health === "critical" ? "text-rose-300" : item.health === "amber" ? "text-orange-300" : "text-cyan-300"}
                  />
                  <span className="font-mono text-xs text-slate-100">{item.id}</span>
                </div>
                <StatusBadge health={item.health} />
              </div>

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="text-sm text-slate-300 font-medium">{item.driver}</div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    {item.route} · {item.destination}
                  </div>
                </div>
                <div className="text-right">
                  {metric(item.temp.toFixed(1), "°C")}
                  <div className="mt-1 text-xs text-slate-500">Risk {item.risk}</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-800 pt-3">
                <div>
                  <div className="text-[11px] text-slate-500 uppercase tracking-wide">Humidity</div>
                  <div className="mt-1 font-mono text-sm text-slate-200">{item.humidity}%</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 uppercase tracking-wide">Door</div>
                  <div className={`mt-1 text-sm font-medium ${item.door === "OPEN" ? "text-rose-300" : "text-emerald-300"}`}>
                    {item.door === "OPEN" ? "Open" : "Sealed"}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 uppercase tracking-wide">ETA</div>
                  <div className="mt-1 font-mono text-sm text-slate-200">{item.eta}</div>
                </div>
              </div>

              {/* Hover cue */}
              <div className="mt-3 text-xs text-slate-600 opacity-0 transition-opacity group-hover:opacity-100">
                Click to inspect →
              </div>
            </button>
          ))}
        </div>

        {/* Empty state */}
        {visible.length === 0 && (
          <div className="p-12 text-center" data-testid="empty-fleet-search">
            <Truck size={25} className="mx-auto text-slate-700" />
            <div className="mt-3 text-sm text-slate-400">No assets match that query.</div>
            <button
              onClick={() => setQuery("")}
              className="mt-2 text-xs text-cyan-300"
              data-testid="button-clear-fleet-search"
            >
              Clear search
            </button>
          </div>
        )}
      </section>

      {/* Detail Modal */}
      {modalTruck && (
        <TruckModal truck={modalTruck} onClose={() => setModalTruck(null)} />
      )}
    </>
  );
}
