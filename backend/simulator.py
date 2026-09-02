import time
import random
import requests

API_URL = "http://localhost:8000/api/v1/telemetry/ingest"

TRUCKS = [
    {"id": "TRK-101", "base_temp": 4.2, "door": "SEALED", "ssid": "PCG-01-NODE"},
    {"id": "TRK-102", "base_temp": -18.0, "door": "SEALED", "ssid": "SLT_Mobitel_4G_Hub"},
    {"id": "TRK-103", "base_temp": 5.0, "door": "SEALED", "ssid": "PCG-03-NODE"},
    {"id": "TRK-104", "base_temp": 3.8, "door": "SEALED", "ssid": "Highway_Toll_WLAN"},
]

SSID_POOLS = ["PCG-01-NODE", "SLT_Mobitel_4G_Hub", "Highway_Toll_WLAN", "Depot_DC_West", "Hospital_Inbound_WLAN"]

def run_simulation():
    print("🚀 Pulsechain Telemetry Simulator started. Streaming payloads to FastAPI...")

    step = 0
    while True:
        step += 1
        for truck in TRUCKS:
            # Normal thermal drift
            temp_noise = random.uniform(-0.3, 0.4)
            current_temp = round(truck["base_temp"] + temp_noise, 1)

            # Standard readings
            humidity = round(random.uniform(45.0, 70.0), 1)
            lux = round(random.uniform(5.0, 15.0), 1)
            door = "SEALED"
            ssid = truck["ssid"]

            # Intentional Anomaly: Truck 103 gets a door spike every 5th cycle
            if truck["id"] == "TRK-103" and step % 5 == 0:
                current_temp = round(current_temp + 4.5, 1)  # Temp spike
                lux = 380.0                                   # Tamper/Door open
                door = "OPEN"
                print(f"⚠️ Triggered Anomaly on {truck['id']}: Door OPEN & Lux Spike!")

            # Random SSID Roaming
            if random.random() < 0.2:
                ssid = random.choice(SSID_POOLS)

            payload = {
                "truck_id": truck["id"],
                "temp": current_temp,
                "humidity": humidity,
                "lux": lux,
                "door": door,
                "ssid": ssid,
                "signal_dbm": random.randint(-80, -50)
            }

            try:
                res = requests.post(API_URL, json=payload, timeout=2)
                print(f"[{truck['id']}] Ingested -> Temp: {current_temp}°C | Health: {res.json().get('evaluated_health')} | Risk: {res.json().get('risk')}%")
            except Exception as e:
                print(f"❌ Failed to reach FastAPI backend: {e}")

        time.sleep(3)

if __name__ == "__main__":
    run_simulation()