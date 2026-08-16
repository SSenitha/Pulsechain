
<div align="center">
  <img src="GitHub Banner.png" alt="PulseChain Banner" width="100%">
</div>

# PulseChain 📈❄️
**Revolutionizing Cold-Chain Monitoring with Advanced Edge Computing & Predictive AI**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![Deployment](https://img.shields.io/badge/deploy-GitHub_Actions-blue)](#)
[![ML Engine](https://img.shields.io/badge/model-TensorFlow-orange)](#)
[![License](https://img.shields.io/badge/license-MIT-green)](#)

## 📋 Overview
PulseChain is a centralized, intelligent web application designed for next-generation cold-chain monitoring. Instead of relying on expensive, power-hungry GPS and heavy edge hardware, PulseChain ingests lightweight data streams from simple simulated IoT sensors. By shifting the heavy analytical lifting to a centralized web backend, the system acts as a predictive engine—using deep learning models to forecast refrigeration failures before a critical spoilage event occurs.

## ✨ Key Features
*   🧠 **Backend Predictive Engine:** A centralized machine learning pipeline built with TensorFlow that analyzes incoming temperature and humidity trends to predict compressor/equipment failures in real-time.
*   📍 **Lightweight Localization:** Utilizes Wi-Fi SSID tracking for precise location identification without the massive battery drain of traditional GPS modules.
*   🔒 **Security & Tamper Detection:** Instantly flags unauthorized access by correlating cargo light sensor data with door (reed switch) statuses.
*   📊 **Real-Time Analytics Dashboard:** A comprehensive frontend web application providing logistics managers with live graphs, heatmaps, and instant predictive alerts.

## 🏗️ System Architecture & Technology Stack
The architecture is specifically designed for communication efficiency, ensuring that resource-constrained IoT edge devices only send essential telemetry, while the robust server handles Big Data analytics.

*   **Frontend Dashboard:** React / Vue.js (Responsive, real-time fleet visualization)
*   **Backend Engine:** Node.js & Python (API routing, data stream ingestion)
*   **Predictive ML Model:** TensorFlow (Deep learning classification and anomaly detection)
*   **Data Simulation:** Python scripts generating synthetic edge telemetry and SSID data
*   **CI/CD & Deployment:** GitHub Actions for automated testing, model validation, and deployment

## ⚙️ CI/CD Automation
This repository utilizes **GitHub Actions** to enforce continuous integration and deployment. Upon every push to the `main` branch, the workflow automatically:

1. Lints the frontend and backend codebase.
2. Runs unit tests on the Node.js API.
3. Validates the TensorFlow model's predictive accuracy against sample datasets.
4. Prepares the production build for deployment.

## 🤝 Contributing
This repository is maintained by the core development team. Feedback, feature requests, and bug reports can be submitted via GitHub Issues.
- Sandaru Wickramasinghe
- Dilini Sewwandi
- Aashinshana Weerakoon
- Ganindu Deshapriya
