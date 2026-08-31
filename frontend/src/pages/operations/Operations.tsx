import { useState } from "react";
import { Check, Send, Shield, Wifi, LockKeyhole } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { useApp } from "@/context/AppContext";

export function Operations() {
  const { trucks, packages, addConsignment, assignConsignment } = useApp();
  const [packageDone, setPackageDone] = useState(false);
  const [dispatchDone, setDispatchDone] = useState(false);

  // Form state for creating a new package
  const [packageForm, setPackageForm] = useState({
    product: "",
    origin: "",
    destination: "",
    min: "0",
    max: "0",
  });

  // Form state for dispatching a package
  const [assignmentForm, setAssignmentForm] = useState({
    packageId: "",
    truck: "",
  });

  // Updating form states
  const updatePackageForm = (key: string, value: string) =>
    setPackageForm((old) => ({ ...old, [key]: value }));

  const updateAssignmentForm = (key: string, value: string) =>
    setAssignmentForm((old) => ({ ...old, [key]: value }));


  // Create a new package and add it to the list
  const createPackage = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const id = `PKG-NEW-${Math.floor(100 + Math.random() * 800)}`;
    const nextPackage = {
      id,
      product: packageForm.product || "Temperature Controlled Consignment",
      lot: "PENDING",
      origin: packageForm.origin || "Northstar Origin",
      destination: packageForm.destination || "Regional DC",
      carrier: "Assigned operator",
      tempMin: Number(packageForm.min),
      tempMax: Number(packageForm.max),
      actual: Number(packageForm.min) + 0.4,
      health: "nominal" as const,
      risk: 8,
      truck: "UNASSIGNED",
      eta: "04:00:00",
      tamper: false,
      updated: "just now",
    };

    addConsignment(nextPackage);
    setPackageDone(true);
    setDispatchDone(false);
  };

  // Dispatch a package by assigning it to a truck
  const dispatchPackage = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const packageId = assignmentForm.packageId.trim();
    if (!packageId) { return; }

    const selectedPackage = packages.find(
      (item) => item.id.toLowerCase() === packageId.toLowerCase(),
    );

    if (!selectedPackage) { return; }
    if (!assignmentForm.truck) { return; }

    assignConsignment(selectedPackage.id, assignmentForm.truck, "Assigned operator");
    setDispatchDone(true);
  };

  // Find the package that matches the ID in the assignment form
  const matchingPackage = assignmentForm.packageId.trim() === ""
    ? null
    : packages.find(
      (item) => item.id.toLowerCase() === assignmentForm.packageId.trim().toLowerCase(),
    );




  //----------------------------------------------------------------------------
  // Render the Operations page with forms for creating and dispatching packages
  //----------------------------------------------------------------------------
  return (
    <>
      <SectionTitle
        eyebrow="PACKAGE REGISTRATION AND DISPATCH CONTROL / NEW MOVEMENT"
        title="Operations"
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,.9fr)]">

        {/* Package Registration - LHS */}
        <div className="space-y-5">
          {/* Create Package Form */}
          <form onSubmit={createPackage} className="panel p-5">
            <div className="mb-6 border-b border-slate-800 pb-4">
              <div className="font-mono text-[10px] tracking-[.16em] text-cyan-400">
                01 / CONSIGNMENT PROFILE
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Create a package record without assigning a truck yet.
              </p>
            </div>

            {/* Form Content */}
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
                    className="h-10 w-full border border-slate-700 bg-slate-900/50 px-3 text-xs text-slate-200 outline-none 
                    placeholder:text-slate-700 focus:border-cyan-400"
                  />
                </label>
              ))}

              {/* Temperature Thresholds: seperate cause flexbox is different */}
              <div>
                <span className="mb-2 block font-mono text-[9px] text-slate-500">
                  ALLOWED TEMP MIN / MAX °C
                </span>
                <div className="flex gap-2">
                  <input
                    data-testid="input-threshold-min"
                    type="number"
                    value={packageForm.min}
                    onChange={(e) => updatePackageForm("min", e.target.value)}
                    className="h-10 w-full border border-slate-700 bg-slate-900/50 px-3 font-mono text-xs text-cyan-200 outline-none focus:border-cyan-400"
                  />
                  <input
                    data-testid="input-threshold-max"
                    type="number"
                    value={packageForm.max}
                    onChange={(e) => updatePackageForm("max", e.target.value)}
                    className="h-10 w-full border border-slate-700 bg-slate-900/50 px-3 font-mono text-xs text-cyan-200 outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

            </div>

            {/* Submit package form content */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Button type="submit" variant="primary" testId="button-create-consignment">
                <Send size={14} /> Create & queue
              </Button>
              <Button
                type="button"
                onClick={() =>
                  setPackageForm({
                    product: "",
                    origin: "",
                    destination: "",
                    min: "0",
                    max: "0",
                  })
                }
                testId="button-reset-consignment"
              >
                Reset form
              </Button>
            </div>

            {/* Reserve space for the success banner so layout stays stable */}
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


        {/* Package Dispatch - RHS */}
        <section>

          {/* Dispatch Form */}
          <form onSubmit={dispatchPackage} className="panel p-5 pb-1">
            <div className="mb-6 border-b border-slate-800 pb-4">
              <div className="font-mono text-[10px] tracking-[.16em] text-cyan-400">
                02 / ASSIGNMENT
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Assign truck and dispatch a package.
              </p>
            </div>

            {/* Dispatch form content */}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block font-mono text-[9px] text-slate-500">
                  PACKAGE ID*
                </span>
                <input
                  required
                  data-testid="input-consignment-driver"
                  value={assignmentForm.packageId}
                  onChange={(e) => updateAssignmentForm("packageId", e.target.value)}
                  placeholder="eg: PKG-XXX-123"
                  className="h-10 w-full border border-slate-700 bg-slate-900/50 px-3 text-xs text-slate-200 outline-none
                placeholder:text-slate-700 focus:border-cyan-400"
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

            {/* Submit dispatch form content */}
            <div className="mt-9.5 flex flex-wrap gap-3 h-10">
              <Button type="submit" variant="primary" testId="button-dispatch-consignment">
                <Send size={14} /> Dispatch
              </Button>
            </div>

            {/* Reserve space for the success banner so layout stays stable */}
            <div className="mt-6 min-h-[46px]">
              {dispatchDone ? (
                <div
                  className="flex items-center gap-2 border border-emerald-400/30 bg-emerald-400/10 p-3 font-mono text-[10px] text-emerald-300"
                  data-testid="status-consignment-dispatched"
                >
                  <Check size={14} /> CONSIGNMENT DISPATCHED · TRUCK ASSIGNED
                </div>
              ) : (
                <div aria-hidden="true" className="h-[46px] w-full" />
              )}
            </div>
          </form>

          {/* Detail panes */}
          <div className="panel p-5 grid gap-4 sm:grid-cols-2">

            {/* Package details form id */}
            <div className="p-3 h-32 overflow-y-auto rounded border border-slate-700 bg-slate-900/40 items-center gap-2 flex">
              {assignmentForm.packageId.trim() === "" ? (
                <div className="text-xs text-slate-700">
                  Enter a package ID to view details
                </div>

              ) : matchingPackage ? (
                <div className="font-mono text-xs text-slate-400 space-y-0.5">
                  <div className="text-sm">{matchingPackage.id}</div>
                  <div className="pb-1.5">{matchingPackage.product}</div>
                  <div>FROM: {matchingPackage.origin}</div>
                  <div>TO .: {matchingPackage.destination}</div>
                  <div>TEMP: {matchingPackage.tempMin}°C – {matchingPackage.tempMax}°C</div>
                </div>

              ) : (
                <div className="text-xs text-amber-300">
                  No package found for "{assignmentForm.packageId}"
                </div>
              )}
            </div>

            {/* Truck details form id */}
            <div className="p-3 h-32 overflow-y-auto rounded border border-slate-700 bg-slate-900/40 items-center gap-2 flex">
              {assignmentForm.truck === "" ? (
                <div className="text-xs text-slate-700">
                  Select a truck to load truck details
                </div>

              ) : (
                trucks.filter((t) => t.id === assignmentForm.truck).map((t) => (
                  <div key={t.id} className="font-mono text-xs text-slate-400 space-y-0.5">
                    <div className="text-sm">{t.id}</div>
                    <div className="pb-1.5">{t.driver}</div>
                    <div>ROU : {t.route}</div>
                    <div>DEST: {t.destination}</div>
                    <div>TEMP: {t.temp}°C</div>
                  </div>
                ))
              )}
            </div>
          </div>

        </section >
      </div >

      {/* Operating policy section - footnote */}
      < div className="panel p-5 pb-1" >
        <div className="font-mono text-[10px] tracking-[.16em] text-slate-500 border-t border-slate-800 pt-4 pl-2">
          OPERATING POLICY
        </div>
        <div className="mt-2 pl-2 text-xs text-slate-500 grid gap-2 sm:grid-cols-3">
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
      </div >

    </>
  );
}
