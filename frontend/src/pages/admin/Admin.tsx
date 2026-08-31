import { useState } from "react";
import { Truck, Users, } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { useApp } from "@/context/AppContext";
import { truckIds } from "@/data/mockData";

export function Admin() {
  const { users, addUser, addVehicle } = useApp();
  const [tab, setTab] = useState<"users" | "vehicles" | "audit">("users");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [vehicle, setVehicle] = useState("");
  return (
    <>
      <SectionTitle
        eyebrow="CONTROL PLANE / SUPER ADMIN"
        title="Admin control"
        action={
          <span className="flex items-center gap-2 font-mono text-[10px] text-emerald-300">
            <span className="status-dot bg-emerald-400" />
            POLICY ENFORCED
          </span>
        }
      />
      <div className="mb-5 flex border-b border-slate-800">
        {(["users", "vehicles", "audit"] as const).map((item) => (
          <button
            onClick={() => setTab(item)}
            key={item}
            className={`border-b-2 px-4 py-3 font-mono text-[10px] tracking-[.1em] transition-colors ${tab === item ? "border-cyan-300 text-cyan-300" : "border-transparent text-slate-600 hover:text-slate-300"}`}
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
      {tab === "users" && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
          <section className="panel overflow-hidden">
            <div className="border-b border-slate-800 p-4">
              <div className="font-mono text-[10px] text-slate-500">
                AUTHORIZED USERS / {users.length}
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
                    <div
                      className="text-xs text-slate-200"
                      data-testid={`text-user-name-${i}`}
                    >
                      {user.name}
                    </div>
                    <div className="mt-1 font-mono text-[9px] text-slate-600">
                      {user.email}
                    </div>
                  </div>
                  <span className="border border-slate-700 px-2 py-1 font-mono text-[9px] text-slate-400">
                    {user.role}
                  </span>
                  <span
                    className={`font-mono text-[9px] ${user.status === "Active" ? "text-emerald-300" : "text-orange-300"}`}
                  >
                    {user.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
          <section className="panel p-5">
            <div className="font-mono text-[10px] tracking-[.16em] text-cyan-400">
              INVITE OPERATOR
            </div>
            <div className="mt-1 text-sm text-slate-200">
              Add a command user
            </div>
            <div className="mt-5 space-y-3">
              <input
                data-testid="input-admin-user-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="h-10 w-full border border-slate-700 bg-slate-900/50 px-3 text-xs text-slate-200 outline-none focus:border-cyan-400"
              />
              <input
                data-testid="input-admin-user-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Work email"
                className="h-10 w-full border border-slate-700 bg-slate-900/50 px-3 text-xs text-slate-200 outline-none focus:border-cyan-400"
              />
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  if (name && email) {
                    addUser({
                      name,
                      email,
                      role: "Operator",
                      status: "Invited",
                      lastActive: "Never",
                    });
                    setName("");
                    setEmail("");
                  }
                }}
                testId="button-admin-invite-user"
              >
                <Users size={14} /> Send invitation
              </Button>
            </div>
          </section>
        </div>
      )}
      {tab === "vehicles" && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
          <section className="panel p-5">
            <div className="font-mono text-[10px] tracking-[.16em] text-cyan-400">
              REGISTRY SNAPSHOT
            </div>
            <div className="mt-1 text-sm text-slate-200">Registered assets</div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {truckIds.map((id) => (
                <div
                  className="flex items-center justify-between border border-slate-800 bg-slate-900/30 p-3"
                  key={id}
                  data-testid={`row-vehicle-${id}`}
                >
                  <span className="font-mono text-xs text-slate-300">{id}</span>
                  <span className="font-mono text-[9px] text-emerald-300">
                    VERIFIED
                  </span>
                </div>
              ))}
            </div>
          </section>
          <section className="panel p-5">
            <div className="font-mono text-[10px] tracking-[.16em] text-cyan-400">
              REGISTER VEHICLE
            </div>
            <input
              data-testid="input-admin-vehicle-id"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              placeholder="Vehicle ID e.g. TRK-113"
              className="mt-5 h-10 w-full border border-slate-700 bg-slate-900/50 px-3 font-mono text-xs text-slate-200 outline-none focus:border-cyan-400"
            />
            <Button
              variant="primary"
              className="mt-3 w-full"
              onClick={() => {
                if (vehicle) {
                  addVehicle({
                    id: vehicle,
                    driver: "Unassigned",
                    route: "Pending",
                    destination: "Pending",
                    health: "offline",
                    temp: 0,
                    humidity: 0,
                    lux: 0,
                    door: "UNKNOWN",
                    risk: 0,
                    eta: "--:--:--",
                    ssid: "PENDING",
                    lastSeen: "never",
                  });
                  setVehicle("");
                }
              }}
              testId="button-admin-register-vehicle"
            >
              <Truck size={14} /> Register asset
            </Button>
          </section>
        </div>
      )}
      {tab === "audit" && (
        <section className="panel">
          <div className="border-b border-slate-800 p-5">
            <div className="font-mono text-[10px] tracking-[.16em] text-cyan-400">
              IMMUTABLE EVENT RECORD
            </div>
            <div className="mt-1 text-sm text-slate-200">
              Administrative activity
            </div>
          </div>
          {[
            ["10:46:09", "PRIYA.N", "User invitation created", "ALLOW"],
            [
              "10:22:51",
              "PRIYA.N",
              "Policy threshold updated / pharma-standard",
              "ALLOW",
            ],
            ["09:58:32", "MARA.O", "Consignment PKG-VAX-881 viewed", "READ"],
            [
              "09:42:17",
              "SYSTEM",
              "Vehicle handshake credentials rotated",
              "SYSTEM",
            ],
          ].map(([time, actor, event, state], i) => (
            <div
              className="flex flex-wrap gap-4 border-b border-slate-800 p-4 font-mono text-[10px]"
              key={time}
              data-testid={`row-admin-audit-${i}`}
            >
              <span className="text-slate-600">{time}Z</span>
              <span className="text-cyan-300">{actor}</span>
              <span className="flex-1 text-slate-300">{event}</span>
              <span className="text-emerald-300">{state}</span>
            </div>
          ))}
        </section>
      )}
    </>
  );
}
