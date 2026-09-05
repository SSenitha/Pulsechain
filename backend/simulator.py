import time
import random
import math
import sys
import requests

API_URL = "http://localhost:8000/api/v1/telemetry/ingest"

# 6 Dedicated Trucks with realistic clinical profiles
TRUCKS = [
    {
        "id": "TRK-101",
        "label": "mRNA Vaccine Cold Chain (Steady Nominal)",
        "base_temp": 4.2,
        "temp_min": 2.0,
        "temp_max": 8.0,
        "base_hum": 54.0,
        "ssid": "SLT_Mobitel_4G_Hub",
        "profile": "nominal_steady",
    },
    {
        "id": "TRK-102",
        "label": "Insulin Cold Chain (Amber Excursion Fluctuation)",
        "base_temp": 3.8,
        "temp_min": 2.0,
        "temp_max": 6.0,
        "base_hum": 48.0,
        "ssid": "Expressway_North_WLAN",
        "profile": "amber_fluctuating_insulin",
    },
    {
        "id": "TRK-103",
        "label": "Blood Bank Transport (PERMANENT RED CRITICAL)",
        "base_temp": 10.2,
        "temp_min": 1.0,
        "temp_max": 6.0,
        "base_hum": 78.0,
        "ssid": "Dambulla_Local_Hub",
        "profile": "permanent_critical",
    },
    {
        "id": "TRK-104",
        "label": "Oncology Antibodies (Amber Thermal Drift Fluctuation)",
        "base_temp": 6.8,
        "temp_min": 2.0,
        "temp_max": 8.0,
        "base_hum": 56.0,
        "ssid": "Southern_Highway_Mesh",
        "profile": "amber_fluctuating_oncology",
    },
    {
        "id": "TRK-105",
        "label": "Frozen Plasma (-20C Deep Freeze with Defrost Amber Cycles)",
        "base_temp": -20.0,
        "temp_min": -25.0,
        "temp_max": -15.0,
        "base_hum": 38.0,
        "ssid": "NorthCentral_Node_02",
        "profile": "amber_fluctuating_cryo",
    },
    {
        "id": "TRK-106",
        "label": "Pediatric Vaccines (Steady Nominal Express)",
        "base_temp": 4.9,
        "temp_min": 2.0,
        "temp_max": 8.0,
        "base_hum": 51.0,
        "ssid": "Port_Inbound_WLAN",
        "profile": "nominal_steady",
    },
]

SSID_POOLS = [
    "SLT_Mobitel_4G_Hub",
    "Expressway_North_WLAN",
    "Dambulla_Local_Hub",
    "Southern_Highway_Mesh",
    "NorthCentral_Node_02",
    "Port_Inbound_WLAN",
    "Highway_Toll_Gate_A1",
    "Hospital_Inbound_WLAN",
    "Depot_DC_West",
]

class TruckSimulatorState:
    def __init__(self, cfg):
        self.cfg = cfg
        self.temp = cfg["base_temp"]
        self.hum = cfg["base_hum"]
        self.tamper = (cfg["profile"] == "permanent_critical")
        self.ssid = cfg["ssid"]

    def tick(self, step):
        profile = self.cfg["profile"]

        # 1. PERMANENT RED CRITICAL (TRK-103)
        # Always breached (tamper=True), temperature excursioning way above 6.0C limit (9.8C - 11.2C)
        if profile == "permanent_critical":
            self.tamper = True
            # Wanders between 9.8C and 11.4C (consistently in Critical zone > max + 2.0C)
            target = 10.4 + 0.6 * math.sin(step * 0.3) + random.uniform(-0.15, 0.15)
            self.temp = round(target, 1)
            self.hum = round(78.0 + random.uniform(-1.0, 1.0), 1)

        # 2. AMBER FLUCTUATION 1: TRK-102 (Insulin, limit max = 6.0C)
        # 18-step cycle: 12 steps nominal (3.8C - 4.5C), 6 steps amber excursion (6.3C - 7.2C)
        elif profile == "amber_fluctuating_insulin":
            self.tamper = False
            cycle_pos = (step + 4) % 18
            if cycle_pos >= 12:
                # Amber excursion: above 6.0C, below 8.0C
                target = 6.4 + 0.5 * math.sin((cycle_pos - 12) * 0.5) + random.uniform(-0.08, 0.08)
                self.temp = round(target, 1)
                self.hum = round(54.0 + random.uniform(-0.5, 0.5), 1)
            else:
                # Nominal safe zone
                target = 3.8 + 0.3 * math.sin(cycle_pos * 0.5) + random.uniform(-0.06, 0.06)
                self.temp = round(target, 1)
                self.hum = round(48.0 + random.uniform(-0.5, 0.5), 1)

        # 3. AMBER FLUCTUATION 2: TRK-104 (Oncology, limit max = 8.0C)
        # 22-step cycle: 14 steps nominal (6.4C - 7.5C), 8 steps amber excursion (8.3C - 9.4C)
        elif profile == "amber_fluctuating_oncology":
            self.tamper = False
            cycle_pos = (step + 11) % 22
            if cycle_pos >= 14:
                # Amber excursion: above 8.0C, below 10.0C
                target = 8.4 + 0.6 * math.sin((cycle_pos - 14) * 0.4) + random.uniform(-0.08, 0.08)
                self.temp = round(target, 1)
                self.hum = round(60.0 + random.uniform(-0.6, 0.6), 1)
            else:
                # Nominal safe zone
                target = 6.6 + 0.4 * math.sin(cycle_pos * 0.4) + random.uniform(-0.06, 0.06)
                self.temp = round(target, 1)
                self.hum = round(56.0 + random.uniform(-0.5, 0.5), 1)

        # 4. AMBER FLUCTUATION 3: TRK-105 (Deep freeze, limit max = -15.0C)
        # 26-step cycle: 18 steps nominal (-21.5C to -18.0C), 8 steps defrost amber (-14.5C to -13.5C)
        elif profile == "amber_fluctuating_cryo":
            self.tamper = False
            cycle_pos = (step + 17) % 26
            if cycle_pos >= 18:
                # Defrost amber excursion: above -15.0C, below -13.0C
                target = -14.4 + 0.6 * math.sin((cycle_pos - 18) * 0.4) + random.uniform(-0.08, 0.08)
                self.temp = round(target, 1)
                self.hum = round(42.0 + random.uniform(-0.5, 0.5), 1)
            else:
                # Nominal deep freeze zone
                target = -19.8 + 1.2 * math.sin(cycle_pos * 0.3) + random.uniform(-0.08, 0.08)
                self.temp = round(target, 1)
                self.hum = round(37.5 + random.uniform(-0.5, 0.5), 1)

        # 5. STEADY NOMINAL: TRK-101 & TRK-106 (Vaccines, limit 2.0C - 8.0C)
        else:
            self.tamper = False
            target = self.cfg["base_temp"] + 0.25 * math.sin(step * 0.3) + random.uniform(-0.05, 0.05)
            self.temp = round(target, 1)
            self.hum = round(self.cfg["base_hum"] + random.uniform(-0.4, 0.4), 1)

        # Occasional SSID Roaming
        if random.random() < 0.12:
            self.ssid = random.choice(SSID_POOLS)

        return self.temp, self.hum, self.tamper, self.ssid

def run_simulation(interval_sec=1.0, max_rounds=None):
    states = [TruckSimulatorState(cfg) for cfg in TRUCKS]
    print(f"[SIM] Pulsechain Telemetry Simulator Active.")
    print(f"[SIM] Config: TRK-103 permanently RED (critical) · TRK-102, TRK-104, TRK-105 AMBER fluctuating.")
    print(f"[SIM] Streaming {len(TRUCKS)} trucks @ {interval_sec}s interval ({len(TRUCKS)/interval_sec:.1f} signals/sec)...")

    step = 0
    total_signals = 0

    while True:
        step += 1
        round_start = time.time()

        for state in states:
            temp, hum, tamper, ssid = state.tick(step)
            tid = state.cfg["id"]

            payload = {
                "tid": tid,
                "temp": temp,
                "humidity": hum,
                "tamper": tamper,
            }

            try:
                res = requests.post(API_URL, json=payload, timeout=1.5)
                status_tag = "[RED/CRITICAL]" if tamper or temp > state.cfg["temp_max"] + 2.0 else ("[AMBER/ALERT]" if temp > state.cfg["temp_max"] else "[NOMINAL/OK]")
                print(f"{status_tag:16} [{tid}] temp={temp:+5.1f}C | hum={hum:4.1f}% | door={'OPEN' if tamper else 'SEALED':6} | ssid={ssid:22} | {res.status_code}")
                total_signals += 1
            except Exception as e:
                print(f"[FAIL] [{tid}] Ingestion error: {e}")

        if max_rounds and step >= max_rounds:
            print(f"[SIM] Completed {max_rounds} rounds ({total_signals} telemetry signals posted).")
            break

        elapsed = time.time() - round_start
        sleep_time = max(0.05, interval_sec - elapsed)
        time.sleep(sleep_time)

if __name__ == "__main__":
    interval = 1.0
    rounds = None
    if len(sys.argv) > 1:
        try:
            interval = float(sys.argv[1])
        except ValueError:
            pass
    if len(sys.argv) > 2:
        try:
            rounds = int(sys.argv[2])
        except ValueError:
            pass

    run_simulation(interval_sec=interval, max_rounds=rounds)