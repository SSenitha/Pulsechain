import { useState } from "react";
import { AlertOctagon, MoreHorizontal, RefreshCw, Wifi, Truck } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, } from "recharts";
import { Button } from "@/components/shared/Button";
import { KpiCard } from "@/components/shared/KpiCard";
import { SearchBox } from "@/components/shared/SearchBox";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { metric } from "@/components/layout/Shell";
import { useApp } from "@/context/AppContext";
import { SectionTitle } from "@/components/shared/SectionTitle";

export function Fleet() {
  const { trucks } = useApp();
  const [selected, setSelected] = useState("TRK-103");
  const [filter, setFilter] = useState<"all" | "critical" | "amber">("all");
  const [query, setQuery] = useState("");

  const visible = trucks.filter((truck) =>
    (filter === "all" || truck.health === filter) &&
    `${truck.id} ${truck.driver} ${truck.route} ${truck.destination}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  const truck = trucks.find((item) => item.id === selected) || visible[0];

  const chart = Array.from({ length: 18 }, (_, i) => ({
    time: `${String(8 + Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`,
    temp:
      (truck?.temp || 4) +
      Math.sin(i * 0.72) * 0.7 +
      (truck?.health === "critical" ? i * 0.07 : 0),
    humidity: (truck?.humidity || 44) + Math.cos(i * 0.45) * 3,
  }));

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
              onClick={() => setFilter("critical")}
              testId="button-focus-critical"
            >
              <AlertOctagon size={14} /> Focus critical
            </Button>
          </div>
        }
      />


      {/* Priority events banner */}
      {/*
      <div className="mb-6 flex flex-wrap items-center gap-3 border border-orange-400/25 bg-orange-400/5 p-3 reveal">
        <div className="grid h-8 w-8 place-items-center bg-orange-400/15 text-orange-300">
          <AlertTriangle size={16} />
        </div>
        <div className="min-w-[220px] flex-1">
          <div className="font-mono text-[10px] tracking-[.12em] text-orange-200">
            2 PRIORITY EVENTS REQUIRE REVIEW
          </div>
          <div className="mt-1 text-xs text-slate-500">
            TRK-103 above allowed range · TRK-108 door seal open for 00:18:44
          </div>
        </div>
        <button
          onClick={() => setSelected("TRK-103")}
          className="font-mono text-[10px] text-orange-300 hover:text-orange-200"
          data-testid="button-review-priority"
        >
          REVIEW QUEUE <ArrowRight size={12} className="ml-1 inline" />
        </button>
      </div>
      */}

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

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(460px,.95fr)]">
        {/* Fleet grid */}
        <section className="panel min-w-0 reveal-2">

          {/* Fleet header and searchbox*/}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 p-4">
            <div>
              <div className="font-mono text-[10px] text-slate-500">
                ACTIVE FLEET / {visible.length.toString().padStart(2, "0")}{" "}
                ASSETS
              </div>
              <div className="mt-1 text-sm font-medium text-slate-200">
                Live vehicle grid
              </div>
            </div>
            <SearchBox
              value={query}
              onChange={setQuery}
              placeholder="Search ID, driver, route"
              testId="input-fleet-search"
            />
          </div>

          {/* Fleet cards */}
          <div className="grid gap-px bg-slate-800/70 sm:grid-cols-2">
            {visible.map((item) => (
              <button
                onClick={() => setSelected(item.id)}
                key={item.id}
                className={`
                  panel-hover p-4 text-left  
                  ${selected === item.id ? "border-cyan-400/70 bg-cyan-300/[.06]" :
                    item.health === "critical" ? "bg-rose-400/10 border-rose-400/50" :
                      item.health === "amber" ? "bg-amber-400/10 border-orange-400/50" :
                        "bg-[#0b1a22] border-slate-800/50"
                  }
                `}
                data-testid={`card-truck-${item.id}`}
              >

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Truck
                      size={15}
                      className={item.health === "critical" ? "text-rose-300"
                        : item.health === "amber" ? "text-orange-300" : "text-cyan-300"
                      }
                    />
                    <span className="font-mono text-xs text-slate-100">
                      {item.id}
                    </span>
                  </div>

                  <StatusBadge health={item.health} />
                </div>

                {/* Truck info */}
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="text-xs text-slate-400">{item.driver}</div>
                    <div className="mt-1 font-mono text-[10px] text-slate-600">
                      {item.route} · {item.destination}
                    </div>
                  </div>
                  <div className="text-right">
                    {metric(item.temp.toFixed(1), "°C")}
                    <div className="mt-1 font-mono text-[9px] text-slate-600">
                      RISK {item.risk}
                    </div>
                  </div>
                </div>

                {/* Additional truck information */}
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-800 pt-3">
                  <div>
                    <div className="font-mono text-[9px] text-slate-600">
                      HUMIDITY
                    </div>
                    <div className="mt-1 font-mono text-[10px] text-slate-300">
                      {item.humidity}%
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] text-slate-600">
                      DOOR
                    </div>
                    <div
                      className={`mt-1 font-mono text-[10px] ${item.door === "OPEN" ? "text-rose-300" : "text-emerald-300"}`}
                    >
                      {item.door}
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] text-slate-600">
                      ETA
                    </div>
                    <div className="mt-1 font-mono text-[10px] text-slate-300">
                      {item.eta}
                    </div>
                  </div>
                </div>

              </button>
            ))}
          </div>

          {/* Empty state/ no search results*/}
          {visible.length === 0 && (
            <div className="p-12 text-center" data-testid="empty-fleet-search">
              <Truck size={25} className="mx-auto text-slate-700" />
              <div className="mt-3 text-sm text-slate-400">
                No assets match that query.
              </div>
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

        {/* Selected truck details */}
        {truck ? (
          <section className="space-y-5 reveal-3">
            <div className="panel">
              <div className="flex items-start justify-between border-b border-slate-800 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Truck size={16} className="text-cyan-300" />
                    <span
                      className="font-mono text-sm text-slate-100"
                      data-testid={`text-selected-truck-${truck.id}`}
                    >
                      {truck.id}
                    </span>
                    <StatusBadge health={truck.health} />
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    {truck.driver} · {truck.route} · ETA {truck.eta}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="px-2"
                  onClick={() => setSelected("TRK-103")}
                  testId="button-reset-selected-truck"
                >
                  <MoreHorizontal size={17} />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-px bg-slate-800/80 sm:grid-cols-4">
                <div className="bg-[#0b1a22] p-4">
                  <div className="font-mono text-[9px] text-slate-600">
                    TEMP
                  </div>
                  <div
                    className={`mt-1 text-xl ${truck.health === "critical" ? "text-rose-300" : "text-cyan-300"}`}
                  >
                    {truck.temp.toFixed(1)}°
                  </div>
                </div>
                <div className="bg-[#0b1a22] p-4">
                  <div className="font-mono text-[9px] text-slate-600">
                    HUMIDITY
                  </div>
                  <div className="mt-1 text-xl text-slate-200">
                    {truck.humidity}%
                  </div>
                </div>
                <div className="bg-[#0b1a22] p-4">
                  <div className="font-mono text-[9px] text-slate-600">LUX</div>
                  <div className="mt-1 text-xl text-slate-200">{truck.lux}</div>
                </div>
                <div className="bg-[#0b1a22] p-4">
                  <div className="font-mono text-[9px] text-slate-600">
                    RISK SCORE
                  </div>
                  <div
                    className={`mt-1 text-xl ${truck.risk > 70 ? "text-rose-300" : truck.risk > 40 ? "text-orange-300" : "text-emerald-300"}`}
                  >
                    {truck.risk}
                  </div>
                </div>
              </div>

            </div>

            {/* Telemetry chart */}
            <div className="panel p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="font-mono text-[10px] text-slate-500">
                    TELEMETRY
                  </div>
                  <div className="mt-1 text-sm text-slate-200">
                    Thermal profile
                  </div>
                </div>
                <div className="flex gap-3 font-mono text-[9px]">
                  <span className="text-cyan-300">— TEMP °C</span>
                  <span className="text-orange-300">— RH %</span>
                </div>
              </div>

              <div
                className="h-[220px] w-full"
                data-testid={`chart-telemetry-${truck.id}`}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chart}>
                    <CartesianGrid stroke="#1c3440" strokeDasharray="2 5" />
                    <XAxis
                      dataKey="time"
                      tick={{
                        fill: "#647d86",
                        fontSize: 9,
                        fontFamily: "DM Mono",
                      }}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="temp"
                      tick={{
                        fill: "#647d86",
                        fontSize: 9,
                        fontFamily: "DM Mono",
                      }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      yAxisId="rh"
                      orientation="right"
                      tick={{
                        fill: "#647d86",
                        fontSize: 9,
                        fontFamily: "DM Mono",
                      }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#0b1a22",
                        border: "1px solid #284451",
                        fontSize: 11,
                      }}
                    />
                    <Line
                      yAxisId="temp"
                      type="monotone"
                      dataKey="temp"
                      stroke="#57e0e5"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      yAxisId="rh"
                      type="monotone"
                      dataKey="humidity"
                      stroke="#f7a94a"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Handshake log */}
            <div className="panel p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="font-mono text-[10px] text-slate-500">
                    HANDSHAKE LOG
                  </div>
                  <div className="mt-1 text-sm text-slate-200">
                    SSID node links
                  </div>
                </div>
                <Wifi size={15} className="text-cyan-300" />
              </div>

              {/* Table - Data has to be dynamic*/}
              <div className="space-y-3">
                {[
                  ["08:42:10", "PCG-EDGE-04", "-62 dBm", "VERIFIED"],
                  ["08:41:55", "PCG-EDGE-04", "-61 dBm", "VERIFIED"],
                  ["08:39:10", "PCG-EDGE-03", "-71 dBm", "ROAMED"],
                  ["08:24:42", "PCG-EDGE-03", "-69 dBm", "VERIFIED"],
                ].map(([time, node, signal, status], i) => (
                  <div
                    key={time + node}
                    className="flex items-center gap-3 font-mono text-[10px]"
                    data-testid={`row-handshake-${i}`}
                  >
                    <span className="text-slate-600">{time}</span>
                    <span className="text-cyan-300">{node}</span>
                    <span className="text-slate-500">{signal}</span>
                    <span
                      className={`ml-auto ${status === "ROAMED" ? "text-orange-300" : "text-emerald-300"}`}
                    >
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

        ) : (
          <div
            className="panel p-10 text-center text-sm text-slate-500"
            data-testid="empty-fleet-detail"
          >
            Select an asset to inspect telemetry.
          </div>
        )}
      </div>
    </>
  );
}
