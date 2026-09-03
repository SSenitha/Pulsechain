import { useState } from "react";
import { Truck, Users, Loader2, CheckCircle2, AlertCircle, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { useApp } from "@/context/AppContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/userManagement";
import { fleetService, type RegisterTruckPayload } from "@/services/fleetService";
import type { Role } from "@/types";

export function Admin() {
  const { users, trucks } = useApp();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<"users" | "vehicles" | "audit">("users");

  // User invite form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("Operator");

  // Vehicle registration form state (complete dispatch parameters)
  const [vehicleId, setVehicleId] = useState("");
  const [driver, setDriver] = useState("");
  const [route, setRoute] = useState("");
  const [destination, setDestination] = useState("");
  const [ssid, setSsid] = useState("");

  // Feedback notifications
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const clearMessages = () => {
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  // --- 1. Invite User Mutation ---
  const inviteUserMutation = useMutation({
    mutationFn: (payload: { name: string; email: string; role: Role }) =>
      userService.inviteUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setSuccessMsg("Operator invitation dispatched successfully.");
      setErrorMsg(null);
      setName("");
      setEmail("");
      setRole("Operator");
      setTimeout(clearMessages, 4000);
    },
    onError: (err: Error) => {
      setErrorMsg(err.message || "Failed to invite user");
      setSuccessMsg(null);
    },
  });

  // --- 2. Register Vehicle Mutation ---
  const registerTruckMutation = useMutation({
    mutationFn: (payload: RegisterTruckPayload) => fleetService.registerTruck(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fleet"] });
      setSuccessMsg("Vehicle asset and transit route registered to fleet ledger.");
      setErrorMsg(null);
      setVehicleId("");
      setDriver("");
      setRoute("");
      setDestination("");
      setSsid("");
      setTimeout(clearMessages, 4000);
    },
    onError: (err: Error) => {
      setErrorMsg(err.message || "Failed to register vehicle asset");
      setSuccessMsg(null);
    },
  });

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    inviteUserMutation.mutate({ name: name.trim(), email: email.trim(), role });
  };

  const handleRegisterVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId.trim()) return;
    registerTruckMutation.mutate({
      truck_id: vehicleId.trim().toUpperCase(),
      driver: driver.trim() || "Unassigned",
      route: route.trim() || "Pending Dispatch",
      destination: destination.trim() || "Regional Hub",
      base_ssid: ssid.trim() || "PCG-BASE-NODE",
    });
  };

  return (
    <>
      <SectionTitle
        eyebrow="CONTROL PLANE / SUPER ADMIN"
        title="Admin Control"
        action={
          <span className="flex items-center gap-2 font-mono text-[10px] text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            POLICY ENFORCED
          </span>
        }
      />

      {/* Global Action Alerts */}
      {successMsg && (
        <div className="mb-4 flex items-center gap-2 border border-emerald-500/40 bg-emerald-950/20 p-3 font-mono text-xs text-emerald-400">
          <CheckCircle2 size={14} />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 flex items-center gap-2 border border-rose-500/40 bg-rose-950/20 p-3 font-mono text-xs text-rose-400">
          <AlertCircle size={14} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="mb-5 flex border-b border-slate-800">
        {(["users", "vehicles", "audit"] as const).map((item) => (
          <button
            onClick={() => {
              setTab(item);
              clearMessages();
            }}
            key={item}
            className={`border-b-2 px-4 py-3 font-mono text-[10px] tracking-[.1em] transition-colors ${tab === item
              ? "border-cyan-300 text-cyan-300"
              : "border-transparent text-slate-600 hover:text-slate-300"
              }`}
            data-testid={`button-admin-tab-${item}`}
          >
            {item === "users"
              ? "USER MANAGEMENT"
              : item === "vehicles"
                ? "VEHICLE REGISTRY"
                : "AUDIT LOG"}
          </button>
        ))}
      </div>

      {/* ─── TAB 1: USERS ─────────────────────────────────────────── */}
      {tab === "users" && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
          <section className="panel overflow-hidden">
            <div className="border-b border-slate-800 p-4">
              <div className="font-mono text-[10px] text-slate-500">
                AUTHORIZED ACCOUNTS / {users.length}
              </div>
            </div>
            <div className="divide-y divide-slate-800">
              {users.map((user, i) => (
                <div
                  className="flex flex-wrap items-center gap-3 p-4"
                  key={user.email}
                  data-testid={`row-user-${i}`}
                >
                  <div className="grid h-8 w-8 place-items-center bg-cyan-300/10 font-mono text-[10px] text-cyan-300">
                    {user.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </div>
                  <div className="min-w-[180px] flex-1">
                    <div className="text-xs text-slate-200" data-testid={`text-user-name-${i}`}>
                      {user.name}
                    </div>
                    <div className="mt-1 font-mono text-[9px] text-slate-500">{user.email}</div>
                  </div>
                  <span className="border border-slate-700 px-2 py-1 font-mono text-[9px] text-slate-400">
                    {user.role}
                  </span>
                  <span
                    className={`font-mono text-[9px] ${user.status === "Active" ? "text-emerald-300" : "text-amber-300"
                      }`}
                  >
                    {user.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* User Invite Form */}
          <section className="panel p-5">
            <div className="font-mono text-[10px] tracking-[.16em] text-cyan-400">
              INVITE OPERATOR
            </div>
            <div className="mt-1 text-sm text-slate-200">Add a command user</div>
            <form onSubmit={handleInviteUser} className="mt-5 space-y-3">
              <label className="block">
                <span className="mb-1 block font-mono text-[9px] text-slate-500">FULL NAME*</span>
                <input
                  required
                  data-testid="input-admin-user-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="h-10 w-full border border-slate-700 bg-slate-900/50 px-3 text-xs text-slate-200 outline-none focus:border-cyan-400"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-mono text-[9px] text-slate-500">WORK EMAIL*</span>
                <input
                  required
                  type="email"
                  data-testid="input-admin-user-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@northstarlogistics.co"
                  className="h-10 w-full border border-slate-700 bg-slate-900/50 px-3 text-xs text-slate-200 outline-none focus:border-cyan-400"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-mono text-[9px] text-slate-500">ASSIGNED ROLE*</span>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="h-10 w-full border border-slate-700 bg-slate-900/50 px-3 text-xs text-slate-200 outline-none focus:border-cyan-400"
                >
                  <option value="Operator">Operator</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </label>

              <Button
                type="submit"
                variant="primary"
                className="mt-2 w-full"
                disabled={inviteUserMutation.isPending}
                testId="button-admin-invite-user"
              >
                {inviteUserMutation.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Users size={14} />
                )}
                {inviteUserMutation.isPending ? "Sending..." : "Send invitation"}
              </Button>
            </form>
          </section>
        </div>
      )}

      {/* ─── TAB 2: VEHICLES ──────────────────────────────────────── */}
      {tab === "vehicles" && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="panel p-5">
            <div className="font-mono text-[10px] tracking-[.16em] text-cyan-400">
              REGISTRY SNAPSHOT
            </div>
            <div className="mt-1 text-sm text-slate-200">
              Registered fleet assets ({trucks.length})
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {trucks.map((truck) => (
                <div
                  className="flex flex-col justify-between border border-slate-800 bg-slate-900/30 p-3.5 rounded-sm"
                  key={truck.id}
                  data-testid={`row-vehicle-${truck.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-100">{truck.id}</span>
                      <div className="text-xs text-slate-400 mt-0.5">{truck.driver}</div>
                    </div>
                    <span
                      className={`font-mono text-[9px] px-1.5 py-0.5 rounded border ${truck.health === "critical"
                        ? "border-rose-500/40 text-rose-400 bg-rose-500/10"
                        : truck.health === "amber"
                          ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
                          : "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                        }`}
                    >
                      {truck.health.toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1 font-mono text-[10px] text-slate-500">
                    <div className="flex items-center gap-1.5 truncate">
                      <Navigation size={10} className="text-cyan-400 shrink-0" />
                      <span className="truncate">{truck.route}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin size={10} className="text-cyan-400 shrink-0" />
                      <span className="truncate">{truck.destination}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Expanded Vehicle Registration Form */}
          <section className="panel p-5">
            <div className="font-mono text-[10px] tracking-[.16em] text-cyan-400">
              REGISTER VEHICLE
            </div>
            <div className="mt-1 text-sm text-slate-200">Onboard new asset & route parameters</div>
            <form onSubmit={handleRegisterVehicle} className="mt-5 space-y-3">
              <label className="block">
                <span className="mb-1 block font-mono text-[9px] text-slate-500">VEHICLE ID*</span>
                <input
                  required
                  data-testid="input-admin-vehicle-id"
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  placeholder="e.g. TRK-114"
                  className="h-10 w-full border border-slate-700 bg-slate-900/50 px-3 font-mono text-xs text-slate-200 outline-none focus:border-cyan-400"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-mono text-[9px] text-slate-500">ASSIGNED DRIVER</span>
                <input
                  data-testid="input-admin-vehicle-driver"
                  value={driver}
                  onChange={(e) => setDriver(e.target.value)}
                  placeholder="e.g. Sol Kim"
                  className="h-10 w-full border border-slate-700 bg-slate-900/50 px-3 text-xs text-slate-200 outline-none focus:border-cyan-400"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-mono text-[9px] text-slate-500">OPERATING ROUTE</span>
                <input
                  data-testid="input-admin-vehicle-route"
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  placeholder="e.g. Colombo Port → Kandy Central"
                  className="h-10 w-full border border-slate-700 bg-slate-900/50 px-3 text-xs text-slate-200 outline-none focus:border-cyan-400"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-mono text-[9px] text-slate-500">DESTINATION HUB</span>
                <input
                  data-testid="input-admin-vehicle-destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Kandy General Hospital"
                  className="h-10 w-full border border-slate-700 bg-slate-900/50 px-3 text-xs text-slate-200 outline-none focus:border-cyan-400"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-mono text-[9px] text-slate-500">BASE SSID NODE</span>
                <input
                  data-testid="input-admin-vehicle-ssid"
                  value={ssid}
                  onChange={(e) => setSsid(e.target.value)}
                  placeholder="e.g. PCG-14-NODE"
                  className="h-10 w-full border border-slate-700 bg-slate-900/50 px-3 font-mono text-xs text-slate-200 outline-none focus:border-cyan-400"
                />
              </label>

              <Button
                type="submit"
                variant="primary"
                className="mt-2 w-full"
                disabled={registerTruckMutation.isPending}
                testId="button-admin-register-vehicle"
              >
                {registerTruckMutation.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Truck size={14} />
                )}
                {registerTruckMutation.isPending ? "Registering..." : "Register asset & route"}
              </Button>
            </form>
          </section>
        </div>
      )}

      {/* ─── TAB 3: AUDIT LOG ─────────────────────────────────────── */}
      {tab === "audit" && (
        <section className="panel">
          <div className="border-b border-slate-800 p-5">
            <div className="font-mono text-[10px] tracking-[.16em] text-cyan-400">
              IMMUTABLE EVENT RECORD
            </div>
            <div className="mt-1 text-sm text-slate-200">Administrative activity</div>
          </div>
          {[
            ["10:46:09", "ADMIN", "User invitation dispatched", "ALLOW"],
            ["10:22:51", "ADMIN", "Policy threshold updated / pharma-standard", "ALLOW"],
            ["09:58:32", "OPERATOR", "Consignment PKG-VAX-881 dispatched", "WRITE"],
            ["09:42:17", "SYSTEM", "Vehicle handshake credentials rotated", "SYSTEM"],
          ].map(([time, actor, event, state], i) => (
            <div
              className="flex flex-wrap gap-4 border-b border-slate-800 p-4 font-mono text-[10px]"
              key={`${time}-${i}`}
              data-testid={`row-admin-audit-${i}`}
            >
              <span className="text-slate-500">{time}Z</span>
              <span className="text-cyan-300">{actor}</span>
              <span className="flex-1 text-slate-300">{event}</span>
              <span
                className={
                  state === "ALLOW"
                    ? "text-emerald-300"
                    : state === "WRITE"
                      ? "text-cyan-300"
                      : "text-amber-300"
                }
              >
                {state}
              </span>
            </div>
          ))}
        </section>
      )}
    </>
  );
}