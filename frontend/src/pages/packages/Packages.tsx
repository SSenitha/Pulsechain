import { useState } from "react";
import { AlertOctagon, Box, Gauge, PackageCheck, } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Metric } from "@/components/shared/Metric";
import { KpiCard } from "@/components/shared/KpiCard";
import { SearchBox } from "@/components/shared/SearchBox";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { StatusBadge, tone } from "@/components/shared/StatusBadge";
//import { useApp } from "@/context/AppContext";

// Database Connection
import { useQuery } from '@tanstack/react-query';
import { packageService } from '@/services/packageService';

export function Packages() {
  //const { packages } = useApp();

  // Database Connection
  const { data: packages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: () => packageService.getPackages()
  });
  //---

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("PKG-BIO-302");
  const [filter, setFilter] = useState<"all" | "critical" | "amber">("all");
  const visible = packages.filter(
    (item) =>
      (filter === "all" || item.health === filter) &&
      `${item.id} ${item.product} ${item.destination} ${item.truck}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const pkg = packages.find((item) => item.id === selected) || visible[0];
  return (
    <>
      <SectionTitle
        eyebrow="INTEGRITY MONITOR / PACKAGES"
        title="Package Integrity"
        action={
          <div className="flex gap-2">
            <Button
              onClick={() => setFilter("all")}
              className={
                filter === "all" ? "border-cyan-400/60 text-cyan-200" : ""
              }
              testId="button-filter-packages-all"
            >
              All {packages.length}
            </Button>
            <Button
              onClick={() => setFilter("critical")}
              className={
                filter === "critical" ? "border-rose-400/60 text-rose-200" : ""
              }
              testId="button-filter-packages-critical"
            >
              <span className="status-dot bg-rose-300" />
              Critical
            </Button>
            <Button
              onClick={() => setFilter("amber")}
              className={
                filter === "amber" ? "border-orange-400/60 text-orange-200" : ""
              }
              testId="button-filter-packages-amber"
            >
              <span className="status-dot bg-orange-300" />
              Amber
            </Button>
          </div>
        }
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          name="In transit"
          value={String(packages.length)}
          note="active consignments"
        />
        <KpiCard
          name="Thermal nominal"
          value={String(packages.filter((p) => p.health === "nominal").length)}
          note="within allowed band"
          accent="emerald"
        />
        <KpiCard
          name="Excursions"
          value="01"
          note="requires intervention"
          accent="rose"
        />
        <KpiCard
          name="Tamper signals"
          value="01"
          note="open investigation"
          accent="orange"
        />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(420px,.8fr)]">
        <section className="panel">
          <div className="border-b border-slate-800 p-4">
            <SearchBox
              value={query}
              onChange={setQuery}
              placeholder="Search package, product, destination"
              testId="input-package-search"
            />
          </div>
          <div className="divide-y divide-slate-800">
            {visible.map((item) => (
              <button
                onClick={() => setSelected(item.id)}
                key={item.id}
                className={`flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-cyan-300/[.04] ${selected === item.id ? "bg-cyan-300/[.06]" : ""}`}
                data-testid={`row-package-${item.id}`}
              >
                <div
                  className={`grid h-9 w-9 place-items-center border ${tone(item.health)}`}
                >
                  <Box size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-slate-200">
                      {item.id}
                    </span>
                    <StatusBadge health={item.health} />
                    {item.tamper && (
                      <span className="font-mono text-[9px] text-rose-300">
                        TAMPER
                      </span>
                    )}
                  </div>
                  <div className="mt-1 truncate text-xs text-slate-400">
                    {item.product} · {item.lot}
                  </div>
                  <div className="mt-1 font-mono text-[9px] text-slate-600">
                    {item.origin} → {item.destination}
                  </div>
                </div>
                <div className="text-right">
                  {Metric(item.actual.toFixed(1), "°C")}
                  <div className="mt-1 font-mono text-[9px] text-slate-600">
                    RISK {item.risk}
                  </div>
                </div>
              </button>
            ))}
          </div>
          {!visible.length && (
            <div
              className="p-12 text-center"
              data-testid="empty-package-search"
            >
              <PackageCheck size={25} className="mx-auto text-slate-700" />
              <p className="mt-3 text-sm text-slate-400">
                No packages in this view.
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setFilter("all");
                }}
                className="mt-2 text-xs text-cyan-300"
                data-testid="button-clear-package-search"
              >
                Reset filters
              </button>
            </div>
          )}
        </section>
        {pkg ? (
          <section className="space-y-5">
            <div className="panel p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-[10px] tracking-[.16em] text-cyan-400">
                    SELECTED CONSIGNMENT
                  </div>
                  <h2
                    className="mt-2 font-mono text-lg text-slate-100"
                    data-testid={`text-selected-package-${pkg.id}`}
                  >
                    {pkg.id}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {pkg.product} · LOT {pkg.lot}
                  </p>
                </div>
                <StatusBadge health={pkg.health} />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div
                  className={`border p-3 ${pkg.actual > pkg.tempMax ? "border-rose-400/35 bg-rose-400/10" : "border-slate-800 bg-slate-900/40"}`}
                >
                  <div className="font-mono text-[9px] text-slate-500">
                    ACTUAL TEMP
                  </div>
                  <div
                    className={`mt-1 text-2xl ${pkg.actual > pkg.tempMax ? "text-rose-300" : "text-cyan-300"}`}
                  >
                    {pkg.actual.toFixed(1)}°C
                  </div>
                </div>
                <div className="border border-slate-800 bg-slate-900/40 p-3">
                  <div className="font-mono text-[9px] text-slate-500">
                    ALLOWED BAND
                  </div>
                  <div className="mt-1 text-2xl text-slate-200">
                    {pkg.tempMin}–{pkg.tempMax}°
                  </div>
                </div>
              </div>
              {pkg.actual > pkg.tempMax && (
                <div
                  className="mt-4 flex gap-3 border border-rose-400/30 bg-rose-400/10 p-3"
                  data-testid="status-package-excursion"
                >
                  <AlertOctagon
                    size={16}
                    className="mt-0.5 shrink-0 text-rose-300"
                  />
                  <div>
                    <div className="font-mono text-[10px] text-rose-200">
                      THERMAL EXCURSION DETECTED
                    </div>
                    <p className="mt-1 text-xs leading-5 text-rose-200/60">
                      Temperature is {(pkg.actual - pkg.tempMax).toFixed(1)}°
                      above upper threshold. Thermal integrity forecast:
                      compromised in 31 min.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="panel p-5">
              <div className="mb-4 font-mono text-[10px] tracking-[.16em] text-slate-500">
                CARRIER & ROUTE
              </div>
              <div className="grid grid-cols-2 gap-y-4">
                <div>
                  <div className="text-[10px] text-slate-600">CARRIER</div>
                  <div className="mt-1 text-sm text-slate-200">
                    {pkg.carrier}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-600">ASSET</div>
                  <div className="mt-1 font-mono text-sm text-cyan-300">
                    {pkg.truck}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-600">ORIGIN</div>
                  <div className="mt-1 text-xs text-slate-300">
                    {pkg.origin}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-600">DESTINATION</div>
                  <div className="mt-1 text-xs text-slate-300">
                    {pkg.destination}
                  </div>
                </div>
              </div>
            </div>
            <div className="panel p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="font-mono text-[10px] tracking-[.16em] text-slate-500">
                  THERMAL DECAY PREDICTION
                </div>
                <Gauge size={15} className="text-orange-300" />
              </div>
              <div className="h-2 bg-slate-800">
                <div
                  className={`h-full ${pkg.health === "critical" ? "bg-rose-400" : pkg.health === "amber" ? "bg-orange-400" : "bg-emerald-400"}`}
                  style={{ width: `${Math.min(100, pkg.risk)}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between font-mono text-[9px] text-slate-600">
                <span>SAFE</span>
                <span>RISK {pkg.risk}/100</span>
                <span>FAILURE</span>
              </div>
              <div className="mt-5 space-y-3 border-t border-slate-800 pt-4">
                {[
                  ["08:24:42", "PACKED", "Memphis Biologics"],
                  ["09:16:08", "SEALED", "Dock 04 / Verified"],
                  ["11:08:31", "IN TRANSIT", pkg.truck],
                  [
                    "NOW",
                    "THERMAL REVIEW",
                    pkg.health === "critical" ? "Auto-escalated" : "Monitoring",
                  ],
                ].map(([time, event, detail]) => (
                  <div
                    className="flex gap-3"
                    key={time + event}
                    data-testid={`row-tamper-log-${time}`}
                  >
                    <div className="w-16 shrink-0 font-mono text-[9px] text-slate-600">
                      {time}
                    </div>
                    <div className="relative border-l border-slate-700 pl-4">
                      <span className="absolute -left-[3px] top-1 h-1.5 w-1.5 bg-cyan-300" />
                      <div className="font-mono text-[10px] text-slate-200">
                        {event}
                      </div>
                      <div className="mt-1 text-[10px] text-slate-500">
                        {detail}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <div
            className="panel p-10 text-center text-sm text-slate-500"
            data-testid="empty-package-detail"
          >
            Select a package to inspect integrity.
          </div>
        )}
      </div>
    </>
  );
}

