import { useState } from "react";
import { Check, Send, Shield, Wifi, LockKeyhole, AlertCircle, Loader2, CircleCheckBig } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { useApp } from "@/context/AppContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { packageService } from "@/services/packageService";
import { fleetService } from "@/services/fleetService";

export function Operations() {
  const { trucks: contextTrucks, packages: contextPackages } = useApp();
  const queryClient = useQueryClient();

  // Fetch live fleet / trucks data from database
  const { data: apiTrucks = [] } = useQuery({
    queryKey: ["fleet"],
    queryFn: () => fleetService.getFleetOverview(),
    refetchInterval: 5000,
  });

  const trucks = apiTrucks.length ? apiTrucks : contextTrucks;

  // Fetch live packages data from database
  const { data: apiPackages = [] } = useQuery({
    queryKey: ["packages"],
    queryFn: () => packageService.getPackages(),
    refetchInterval: 5000,
  });

  const packagesList = apiPackages.length ? apiPackages : contextPackages;

  const [packageDone, setPackageDone] = useState(false);
  const [dispatchDone, setDispatchDone] = useState(false);
  const [deliverDone, setDeliverDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form states
  const [packageForm, setPackageForm] = useState({
    product: "",
    origin: "",
    destination: "",
    min: "2.0",
    max: "8.0",
  });

  const [assignmentForm, setAssignmentForm] = useState({
    packageId: "",
    truck: "",
  });

  const updatePackageForm = (key: string, value: string) =>
    setPackageForm((old) => ({ ...old, [key]: value }));

  const updateAssignmentForm = (key: string, value: string) =>
    setAssignmentForm((old) => ({ ...old, [key]: value }));

  // --- 1. Create Package Mutation ---
  const createPackageMutation = useMutation({
    mutationFn: (payload: {
      product: string;
      origin: string;
      destination: string;
      tempMin: number;
      tempMax: number;
    }) => packageService.createPackage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      setPackageDone(true);
      setFormError(null);
      setPackageForm({
        product: "",
        origin: "",
        destination: "",
        min: "2.0",
        max: "8.0",
      });
      setTimeout(() => setPackageDone(false), 4000);
    },
    onError: (err: Error) => {
      setFormError(err.message || "Failed to create consignment");
    },
  });

  // --- 2. Assign Package Mutation ---
  const assignPackageMutation = useMutation({
    mutationFn: ({ packageId, truckId, carrier }: { packageId: string; truckId: string; carrier: string }) =>
      packageService.assignPackage(packageId, { truck: truckId, carrier }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      queryClient.invalidateQueries({ queryKey: ["fleet"] });
      setDispatchDone(true);
      setFormError(null);
      setAssignmentForm({ packageId: "", truck: "" });
      setTimeout(() => setDispatchDone(false), 4000);
    },
    onError: (err: Error) => {
      setFormError(err.message || "Failed to dispatch consignment");
    },
  });

  // --- 3. Deliver Package Mutation ---
  const deliverPackageMutation = useMutation({
    mutationFn: ({ packageId }: { packageId: string }) =>
      packageService.markPackageDelivered(packageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      queryClient.invalidateQueries({ queryKey: ["fleet"] });
      setDeliverDone(true);
      setFormError(null);
      setAssignmentForm({ packageId: "", truck: "" });
      setTimeout(() => setDeliverDone(false), 4000);
    },
    onError: (err: Error) => {
      setFormError(err.message || "Failed to mark delivery");
    },
  });

  // Handlers
  const handleCreatePackage = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const tempMin = parseFloat(packageForm.min);
    const tempMax = parseFloat(packageForm.max);

    if (tempMin >= tempMax) {
      setFormError("Minimum temperature must be lower than maximum temperature.");
      return;
    }

    createPackageMutation.mutate({
      product: packageForm.product.trim() || "Cold Chain Consignment",
      origin: packageForm.origin.trim(),
      destination: packageForm.destination.trim(),
      tempMin,
      tempMax,
    });
  };

  const handleDispatchPackage = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const packageId = assignmentForm.packageId.trim();
    if (!packageId || !assignmentForm.truck) return;

    const selectedTruck = trucks.find((t) => t.id === assignmentForm.truck);
    const carrier = selectedTruck?.driver || "Assigned Driver";

    assignPackageMutation.mutate({
      packageId,
      truckId: assignmentForm.truck,
      carrier,
    });
  };

  const handleDeliverPackage = () => {
    const packageId = assignmentForm.packageId.trim();
    if (!packageId) {
      setFormError("Please enter a Package ID to mark as delivered.");
      return;
    }
    deliverPackageMutation.mutate({ packageId });
  };

  // Live lookup matching package
  const matchingPackage =
    assignmentForm.packageId.trim() === ""
      ? null
      : packagesList.find(
        (item) => item.id.toLowerCase() === assignmentForm.packageId.trim().toLowerCase()
      );

  return (
    <>
      <SectionTitle
        eyebrow="PACKAGE REGISTRATION AND DISPATCH CONTROL / NEW MOVEMENT"
        title="Operations"
      />

      {formError && (
        <div className="mb-4 flex items-center gap-2 border border-rose-500/40 bg-rose-950/20 p-3 font-mono text-xs text-rose-400">
          <AlertCircle size={14} />
          <span>{formError}</span>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,.9fr)]">
        {/* Package Registration - LHS */}
        <div className="space-y-5">
          <form onSubmit={handleCreatePackage} className="panel p-5">
            <div className="mb-6 border-b border-slate-800 pb-4">
              <div className="font-mono text-[10px] tracking-[.16em] text-cyan-400">
                01 / CONSIGNMENT PROFILE
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Create a package record without assigning a truck yet.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["origin", "ORIGIN FACILITY*", "e.g. CPC Warehouse"],
                ["destination", "DESTINATION*", "e.g. Kalubowila Hospital"],
                ["product", "PRODUCT / DESCRIPTION", "e.g. Recombinant vaccine"],
              ].map(([key, name, placeholder]) => (
                <label key={key} className="block">
                  <span className="mb-2 block font-mono text-[9px] tracking-[.12em] text-slate-500">
                    {name}
                  </span>
                  <input
                    required={key !== "product"}
                    data-testid={`input-consignment-${key}`}
                    value={packageForm[key as keyof typeof packageForm]}
                    onChange={(e) => updatePackageForm(key, e.target.value)}
                    placeholder={placeholder}
                    className="h-10 w-full border border-slate-700 bg-slate-900/50 px-3 text-xs text-slate-200 outline-none placeholder:text-slate-700 focus:border-cyan-400"
                  />
                </label>
              ))}

              <div>
                <span className="mb-2 block font-mono text-[9px] text-slate-500">
                  ALLOWED TEMP MIN / MAX °C*
                </span>
                <div className="flex gap-2">
                  <input
                    required
                    data-testid="input-threshold-min"
                    type="number"
                    step="0.1"
                    value={packageForm.min}
                    onChange={(e) => updatePackageForm("min", e.target.value)}
                    className="h-10 w-full border border-slate-700 bg-slate-900/50 px-3 font-mono text-xs text-cyan-200 outline-none focus:border-cyan-400"
                  />
                  <input
                    required
                    data-testid="input-threshold-max"
                    type="number"
                    step="0.1"
                    value={packageForm.max}
                    onChange={(e) => updatePackageForm("max", e.target.value)}
                    className="h-10 w-full border border-slate-700 bg-slate-900/50 px-3 font-mono text-xs text-cyan-200 outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                type="submit"
                variant="primary"
                testId="button-create-consignment"
                disabled={createPackageMutation.isPending}
              >
                {createPackageMutation.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                {createPackageMutation.isPending ? "Queuing..." : "Create & queue"}
              </Button>
              <Button
                type="button"
                onClick={() =>
                  setPackageForm({
                    product: "",
                    origin: "",
                    destination: "",
                    min: "2.0",
                    max: "8.0",
                  })
                }
                testId="button-reset-consignment"
              >
                Reset form
              </Button>
            </div>

            <div className="mt-4 min-h-[46px]">
              {packageDone ? (
                <div
                  className="flex items-center gap-2 border border-emerald-400/30 bg-emerald-400/10 p-3 font-mono text-[10px] text-emerald-300"
                  data-testid="status-consignment-created"
                >
                  <Check size={14} /> PACKAGE CREATED · READY FOR ASSIGNMENT
                </div>
              ) : (
                <div aria-hidden="true" className="h-[46px] w-full" />
              )}
            </div>
          </form>
        </div>


        {/* =============================================================================================================================== */}
        {/* Package Dispatch - RHS */}
        <section>
          <form onSubmit={handleDispatchPackage} className="panel p-5 pb-1">
            <div className="mb-6 border-b border-slate-800 pb-4">
              <div className="font-mono text-[10px] tracking-[.16em] text-cyan-400">
                02 / ASSIGNMENT
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Assign truck and dispatch a package.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block font-mono text-[9px] text-slate-500">
                  PACKAGE ID*
                </span>
                <input
                  required
                  data-testid="input-consignment-packageId"
                  value={assignmentForm.packageId}
                  onChange={(e) => updateAssignmentForm("packageId", e.target.value.toUpperCase())}
                  placeholder="e.g. PKG-VAX-881"
                  className="h-10 w-full border border-slate-700 bg-slate-900/50 px-3 text-xs text-slate-200 outline-none placeholder:text-slate-700 focus:border-cyan-400"
                />
              </label>

              <label className="block">
                <span className="mb-2 block font-mono text-[9px] text-slate-500">
                  ACTIVE TRUCK*
                </span>
                <select
                  required
                  data-testid="select-consignment-truck"
                  value={assignmentForm.truck}
                  onChange={(e) => updateAssignmentForm("truck", e.target.value)}
                  className="h-10 w-full border border-slate-700 bg-slate-900/50 px-3 text-xs text-slate-200 outline-none focus:border-cyan-400"
                >
                  <option value="">Select a truck</option>
                  {trucks
                    .filter((t) => t.health !== "critical")
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.id} · {t.driver}
                      </option>
                    ))}
                </select>
              </label>
            </div>

            <div className="mt-9.5 flex flex-wrap gap-3 h-10">
              <Button
                type="submit"
                variant="primary"
                testId="button-dispatch-consignment"
                disabled={assignPackageMutation.isPending}
              >
                {assignPackageMutation.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                {assignPackageMutation.isPending ? "Dispatching..." : "Dispatch"}
              </Button>

              {/* Deliver button */}
              <Button
                type="button"
                onClick={handleDeliverPackage}
                disabled={deliverPackageMutation.isPending}
                className="bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/40"
                testId="button-deliver-consignment"
              >
                {deliverPackageMutation.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CircleCheckBig size={14} />
                )}
                {deliverPackageMutation.isPending ? "Updating..." : "Delivered"}
              </Button>
            </div>

            <div className="mt-6 min-h-[46px]">
              {dispatchDone ? (
                <div
                  className="flex items-center gap-2 border border-emerald-400/30 bg-emerald-400/10 p-3 font-mono text-[10px] text-emerald-300"
                  data-testid="status-consignment-dispatched"
                >
                  <Check size={14} /> CONSIGNMENT DISPATCHED · TRUCK ASSIGNED
                </div>
              ) : deliverDone ? (
                <div
                  className="flex items-center gap-2 border border-emerald-400/30 bg-emerald-400/10 p-3 font-mono text-[10px] text-emerald-300"
                  data-testid="status-consignment-delivered"
                >
                  <CircleCheckBig size={14} /> CONSIGNMENT DELIVERED
                </div>
              ) : (
                <div aria-hidden="true" className="h-[46px] w-full" />
              )}
            </div>
          </form>

          {/* Quick Details Inspection Cards */}
          <div className="panel p-5 mt-4 grid gap-4 sm:grid-cols-2">
            <div className="p-3 h-32 overflow-y-auto rounded border border-slate-700 bg-slate-900/40 items-center flex">
              {assignmentForm.packageId.trim() === "" ? (
                <div className="text-xs text-slate-500">
                  Enter a package ID to inspect details
                </div>
              ) : matchingPackage ? (
                <div className="font-mono text-xs text-slate-400 space-y-0.5">
                  <div className="text-sm font-semibold text-slate-200">{matchingPackage.id}</div>
                  <div className="pb-1 text-cyan-300">{matchingPackage.product}</div>
                  <div>FROM: {matchingPackage.origin}</div>
                  <div>TO: {matchingPackage.destination}</div>
                  <div>TEMP: {matchingPackage.tempMin}°C – {matchingPackage.tempMax}°C</div>
                </div>
              ) : (
                <div className="text-xs text-amber-400">
                  No package found for "{assignmentForm.packageId}"
                </div>
              )}
            </div>

            <div className="p-3 h-32 overflow-y-auto rounded border border-slate-700 bg-slate-900/40 items-center flex">
              {assignmentForm.truck === "" ? (
                <div className="text-xs text-slate-500">
                  Select a truck to preview assignment
                </div>
              ) : (
                trucks
                  .filter((t) => t.id === assignmentForm.truck)
                  .map((t) => (
                    <div key={t.id} className="font-mono text-xs text-slate-400 space-y-0.5">
                      <div className="text-sm font-semibold text-slate-200">{t.id}</div>
                      <div className="pb-1 text-cyan-300">{t.driver}</div>
                      <div>ROUTE: {t.route}</div>
                      <div>DEST: {t.destination}</div>
                      <div>TEMP: {t.temp}°C</div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Operating policy footer */}
      <div className="panel p-3 mt-5">
        <div className="font-mono text-[10px] tracking-[.16em] text-slate-500">
          OPERATING POLICY
        </div>
        <div className="mt-2 pl-2 text-xs text-slate-500 grid gap-2 sm:grid-cols-3 place-items-center">
          <div className="flex gap-2">
            <Shield size={14} className="text-cyan-300" /> Threshold breach auto-escalates to command.
          </div>
          <div className="flex gap-2">
            <Wifi size={14} className="text-cyan-300" /> Handshake required before departure.
          </div>
          <div className="flex gap-2">
            <LockKeyhole size={14} className="text-cyan-300" /> Audit record is immutable after dispatch.
          </div>
        </div>
      </div>
    </>
  );
}