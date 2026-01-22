# ☀️ SOLIX: Intelligent Rooftop Solar Analysis Agent

> **Intelligent insights for rooftop energy and climate-driven decisions.**

![Project Status](https://img.shields.io/badge/Status-Prototype-blue)
![Tech Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20Python%20AI-green)
![AI Model](https://img.shields.io/badge/Model-YOLOv8%20%2B%20Gemini-orange)

## 📖 Overview

**SOLIX** is an intelligent AI agent designed to bridge the gap between homeowners and solar energy adoption. It solves the "decision paralysis" many users face by providing instant, data-driven feasibility studies.

Unlike simple calculators, SOLIX uses **Computer Vision (YOLOv8)** to analyze the physical roof structure from satellite images and a **RAG-based Chatbot (Google Gemini)** to provide personalized financial and technical advice.

---

## 🚀 Key Features

### 1. 👁️ Visual Analysis Engine
- **Custom AI Model:** Uses a fine-tuned `YOLOv8` model (`best.pt`) to detect roof boundaries and obstacles.
- **Smart Filtering:** Distinguishes between "Usable Flat Area" and "Obstacles" (vents, chimneys) for precise panel placement.

### 2. 💰 Financial & Energy Intelligence
- **NASA Data Integration:** Fetches real-time Solar Irradiance (GHI) via the **NASA POWER API** for accurate energy forecasting.
- **ROI Calculator:** Computes Payback Period, Monthly Savings, and Loan Installments based on live tariff rates.

### 3. 💬 Intelligent RAG Chatbot
- **Context-Aware:** "Remembers" the user's roof analysis and financial results during the conversation.
- **Knowledge Base:** Built on **LangChain** & **ChromaDB**, trained on technical solar manuals (PDFs) and scraped government policies.
- **Live Data:** Uses **BeautifulSoup** to scrape real-time electricity tariffs.

---

## 🛠️ Tech Stack

### **Frontend (User Interface)**
* **React + Vite:** Fast, responsive UI.
* **Tailwind CSS:** Modern styling and dark mode support.
* **Lucide React:** Icons and visual elements.

### **Backend (Orchestration API)**
* **Python FastAPI:** High-performance async API.
* **Uvicorn:** ASGI Server.
* **Pydantic:** Data validation.

### **AI & Data Engineering**
* **Vision:** PyTorch, Ultralytics YOLOv8.
* **LLM:** Google Gemini (2.0 Flash / 1.5 Pro).
* **Orchestration:** LangChain.
* **Memory:** ChromaDB (Vector Database).
* **Data Acquisition:** BeautifulSoup4 (Web Scraping), pypdf (Document Parsing).

---

## ⚙️ Installation & Setup

### Prerequisites
* Node.js & npm
* Python 3.10+
* Git (with LFS support)

### 1. Clone the Repository
**Important:** We use Git LFS for the AI model.
```bash
git lfs install
git clone [https://github.com/YOUR_USERNAME/solix.git](https://github.com/YOUR_USERNAME/solix.git)
cd solix
```

2. Backend Setup

Navigate to the backend folder and install Python dependencies.
```
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```
Configuration: Create a .env file in the backend folder and add your API key:
```
GOOGLE_API_KEY=your_gemini_api_key_here
```
Initialize AI Memory: Run this script to build the vector database from your PDFs/Data.
```
python build_memory.py
```
Run Server:
```
python -m uvicorn main:app --reload
```
Server will start at http://127.0.0.1:8000

3. Frontend Setup
Open a new terminal and navigate to the frontend folder.
```
cd frontend
npm install
npm run dev
```
<img width="1439" height="752" alt="Screenshot 2026-01-23 043203" src="https://github.com/user-attachments/assets/e991c5f8-1cea-43bb-a08a-9159c56b33e5" />




