# SOLIX – Full System Workflow

**SOLIX** is an AI-powered solar feasibility platform for Sri Lanka. It combines **computer vision** (roof detection), **solar/climate data**, **financial calculations**, and a **RAG-based chatbot** to provide rooftop solar insights and answers from official PDFs and websites.

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React + Vite)                        │
│  InputAnalysisPanel │ InsightsResultsSection │ VisualAnalysisPanel       │
│  ReportExportSection │ ChatBot │ SettingsPanel │ Navbar                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    HTTP (analyze + chat) │ axios
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (FastAPI)                                │
│  /api/analyze/full  │  /api/chat  │  /static (PDFs, temp images)         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌───────────────┐         ┌─────────────────┐         ┌─────────────────┐
│ CV Engine     │         │ Solar Engine    │         │ RAG Engine      │
│ (YOLO roof    │         │ (NASA + CEB     │         │ (Chroma +       │
│  segmentation)│         │  financials)    │         │  Gemini)        │
└───────────────┘         └─────────────────┘         └─────────────────┘
        │                           │                           │
        ▼                           ▼                           ▼
  best.pt (YOLO)        NASA POWER API              chroma_db + knowledge_base
  (trained model)       Esri satellite tiles        PDFs + scraped URLs
```

---

## 2. Workflow A: **Full Roof Analysis** (`/api/analyze/full`)

End-to-end flow from user input to PDF report and UI results.

---

### 2.0 Roof Analysis – What It Actually Does (Plain Language)

**Goal:** Figure out **how much roof area** you have (in square metres) so SOLIX can tell you how big a solar system fits, how much energy it will produce, and what you might earn.

**In one sentence:** The system takes a **picture of a roof** (either you upload one or it fetches a **satellite photo** of your location), runs an **AI model** to find and outline roof surfaces in that image, converts those outlines into **real-world area (m²)**, then uses that area to **size a solar system** and **estimate earnings**.

**Why area matters:** More roof area → more panels → more kW → more units sold to the grid. The roof analysis step gives that crucial “how much roof?” number. Everything else (system size, payback, etc.) builds on it.

**What you get:**

1. An **annotated image**: your roof photo with coloured outlines around each detected roof surface.
2. A **usable roof area** in m² (or a fallback “estimated” value if the AI can’t see roofs clearly).
3. **Financials**: recommended system size, monthly generation, savings, payback — all derived from that area plus your location, bill, and connection type.

The rest of this section walks through **how** each of those steps works.

---

### 2.1 User Input (Frontend)

**InputAnalysisPanel** collects:

- **District** – Sri Lankan district (e.g. Colombo, Jaffna).
- **Connection phase** – Single (30A, max 5 kW) or Three (30A/60A, up to 100 kW).
- **Monthly bill (LKR)** – Optional; used to size system to usage.
- **Latitude / Longitude** – Or “Use My Location” (browser geolocation).
- **Roof image (optional)** – User-uploaded image. If omitted, backend fetches satellite imagery.

User clicks **“Analyze Project”** → `handleAnalyze` in **App.jsx** builds `FormData` and POSTs to `http://127.0.0.1:8000/api/analyze/full`.

---

### 2.2 Step 1: Get a Roof Image

**What happens:** The backend needs **raw image bytes** (a photo) of a roof. There are two ways it gets them.

| Source | When | How |
|--------|------|-----|
| **User upload** | User selects a file in “Upload Roof Image” | Backend reads the uploaded file → image bytes. |
| **Satellite** | User leaves upload empty but provides **lat/lon** | Backend calls **`image_fetcher.fetch_satellite_image(lat, lon)`**. |

**Satellite fetch in more detail:**

- Maps (e.g. Google Maps) divide the world into **tiles** at different zoom levels. At **zoom 19**, one tile is a small patch of land (roughly a few dozen metres across).
- The code converts **(latitude, longitude)** into **tile coordinates** (math: Web Mercator projection).
- It requests that tile from **Esri World Imagery** (a free satellite imagery service). The URL looks like:  
  `.../World_Imagery/MapServer/tile/19/{y}/{x}`.
- The response is **image bytes** (same format as a JPEG you’d upload).

**Why it matters:** Without an image, there’s nothing for the AI to analyse. Upload = your own photo (e.g. drone, phone). No upload = SOLIX uses a satellite view of your coordinates, so you can still get an analysis without visiting the site.

---

### 2.3 Step 2: Computer Vision – Find Roofs and Measure Them

**What happens:** The **CV (computer vision) engine** takes the image bytes, runs a **YOLO** model to find “roof” regions, and turns those into **areas in m²**.

**YOLO and “roof”:**

- **YOLO** is an object-detection model. Here, a **segmentation** variant is used: it doesn’t just draw boxes around roofs — it **paints a mask** for each roof (which pixels belong to roof #1, roof #2, etc.).
- The model file is **`best.pt`**. It was **trained** (see §4) on images of **Sri Lankan roofs** — so it’s looking for that specific type of roof.
- **Output:**  
  - A list of **detected objects**. Each has an **instance mask** (which pixels form that roof).  
  - **Pixel area** = number of pixels in that mask.  
  - **Real-world area** = `pixel_area × 0.09` m². The **0.09** comes from typical satellite resolution at zoom 19: ~0.3 m per pixel, so 0.3×0.3 ≈ 0.09 m² per pixel.

**Concrete steps in code:**

1. Decode image bytes → OpenCV image.
2. Run **YOLO** on that image → get **masks** (one per roof).
3. For each mask:  
   - Count pixels → **pixel_area**.  
   - Multiply by **0.09** → **estimated_m2** for that roof.
4. Draw the masks/outlines on the image (coloured overlays) → **annotated image**.
5. Encode that annotated image as **base64** so the frontend can show it.

**What you get from this step:**

- **`detection_count`**: number of roof surfaces found.
- **`objects`**: each with `id`, `pixel_area`, `estimated_m2`.
- **`annotated_image`**: the roof photo with AI-drawn outlines (base64). That’s the “AI overlay” you see in the **Visual Analysis** panel.

**Why it matters:** This is where “picture of a roof” becomes “X m² of roof.” The solar and financial logic later uses that X.

---

### 2.4 Step 3: Roof Area and Fallback

**What happens:** The backend **sums** `estimated_m2` over all detected objects → **total roof area**.

- **If at least one roof was detected:**  
  `total_area_m2` = that sum.  
  `is_estimated` = **false** (we’re using AI-measured area).

- **If nothing was detected** (model didn’t find any roofs):  
  `total_area_m2` = **60.0** m² (a default).  
  `is_estimated` = **true**.

**Why a fallback?** Sometimes the image is unclear, the roof type isn’t recognised, or the tile is mostly trees/roads. Rather than failing, SOLIX assumes a “typical” small roof (60 m²) and continues. The UI shows an **“Estimated – Low Visibility”** badge so you know it’s not from actual detection.

**What uses this number:** The **solar engine** (§2.5) uses `total_area_m2` to compute usable roof space, max system size, and then generation, earnings, and payback.

**Roof analysis flow (summary):**

```
  [Upload OR Satellite]  →  Image bytes  →  YOLO (find roofs)  →  Masks
                                                                     ↓
  total_area_m2  ←  Sum(estimated_m2)  ←  Pixel area × 0.09   ←  Per-roof
       ↓
  Solar engine (system size, generation, payback, PDF…)
```

---

### 2.5 Solar & Financial Engine

**`solar_engine.SolarCalculator`:**

1. **Irradiance:**  
   - Calls **NASA POWER** `ALLSKY_SFC_SW_DWN` for (lat, lon).  
   - Fallback: district-based “sun hours” table if API fails.

2. **`calculate_roi(...)`** (simplified):
   - **Usable roof** = `total_area_m2 * 0.7`.
   - **Max roof capacity (kW)** = `usable_area / 6.0`.
   - **Phase limit:** Single → 5 kW, Three → 100 kW.  
     Effective max = min(roof capacity, phase limit).
   - **If monthly bill > 0:**  
     Estimate usage from bill → required kW → recommend system size (capped by effective max).  
     **Else:** recommend effective max.
   - **Generation:** `kW × irradiance × 30 × 0.75` → monthly kWh.
   - **Tariff:** CEB 2025/2026 buy-back (0–5 kW: 20.90, 5–20: 19.61, 20–100: 17.46 LKR/unit).
   - **Monthly income** = units × buy-back rate.
   - **Battery scenario:** 50% day / 50% night export (night 45.80 LKR/unit) → extra profit vs day-only.
   - **Investment** = `kW × 280_000` LKR.
   - **Loan:** installment from `loan_rate`, `loan_years`; **payback** = investment / (monthly_income × 12).

Returns `financial_report` (system size, generation, tariff, income, payback, investment, loan, etc.).

### 2.6 PDF Report

**`pdf_engine.generate_solar_pdf`:**

- Writes **annotated roof image** to `static/temp_roof.jpg`.
- Builds PDF with **FPDF**: location, roof area, system size, generation, CEB tariff, earnings, payback.
- Saves as `static/Solar_Report_{district}.pdf`.

### 2.7 API Response

Returns JSON:

- `status`: `"success"` | `"error"`.
- `roof_analysis`: CV results + `total_area_m2`, `is_estimated`, `annotated_image`.
- `financial_report`: full solar/financial dict.
- `pdf_url`: e.g. `http://127.0.0.1:8000/static/Solar_Report_Colombo.pdf`.

### 2.8 Frontend After Analysis

- **InsightsResultsSection:**  
  Shows AI recommendation (kW), roof area (with “estimated” badge if fallback), annual/monthly generation, monthly savings, payback, investment, loan, net monthly impact.

- **VisualAnalysisPanel:**  
  Side-by-side: **original** (user image or N/A) and **AI overlay** (base64 from `roof_analysis.annotated_image`).

- **ReportExportSection:**  
  “Export Full Analysis Report” opens `pdf_url` in a new tab to download the PDF.

---

## 3. Workflow B: **Chatbot** (`/api/chat`)

Q&A over Sri Lankan solar policy, tariffs, and procedures using a **RAG** pipeline.

### 3.1 User Message (Frontend)

**ChatBot** component:

- User types in input → **Send** (or Enter).
- Appends user message to `messages`, sets `loading`, POSTs to `http://127.0.0.1:8000/api/chat` with `{ message, history }`.  
  Backend currently uses only `message`; `history` is available for future use.

### 3.2 RAG Pipeline (Backend)

**`rag_engine.SolarRAG`:**

1. **Embeddings:**  
   HuggingFace `all-MiniLM-L6-v2` (same as in `build_memory`).

2. **Vector DB:**  
   **Chroma** at `chroma_db`, persisted.  
   Retriever: top **k=5** chunks per query.

3. **LLM:**  
   **Google Gemini** (`gemini-flash-latest`) for generating the answer.

4. **Prompt:**  
   System: “You are SOLIX, Sri Lankan solar expert. Use the retrieved context. If not in context, say so. Use LKR.”  
   Human: `{input}` = user message.

5. **Chain:**  
   - **Retriever** → fetch relevant chunks from Chroma.  
   - **Stuff documents** chain → inject chunks as `{context}` into prompt, call Gemini.

6. **`get_answer(query)`:**  
   Invoke chain, return `response["answer"]` (or error message).

### 3.3 Knowledge Base (Precomputed)

**`build_memory.py`:**

- **PDFs:** All `.pdf` in `knowledge_base/` (e.g. CEB, PUCSL, NASA, rooftop solar docs).
- **Web:** Scrapes **PUCSL**, **energy.gov.lk**, **CEB** URLs (tariffs, domestic, rooftop PV, Soorya Bala Sangramaya, etc.).
- **Split:** `RecursiveCharacterTextSplitter` (chunk 1000, overlap 200).
- **Embed:** Same `all-MiniLM-L6-v2` → **Chroma** at `chroma_db`.

Must be run **before** using the chatbot; otherwise RAG fails with “Database not found”.

### 3.4 Frontend After Reply

- Bot reply appended to `messages` and displayed.
- “Thinking...” shown while `loading`.

---

## 4. Training the Roof Detection Model (Offline)

**`training/train_model.py`:**

1. Load **YOLOv8n-seg** (`yolov8n-seg.pt`).
2. Train on `data.yaml`:
   - **Class:** `roof_sl` (Sri Lankan roofs).
   - Images/labels under `datasets` (train/val).
3. Train 50 epochs (CPU or GPU via `device`).
4. Export **best** weights → e.g. `solar_agent_outputs/sri_lanka_roof_v1/weights/best.pt`.
5. **Copy `best.pt`** to backend root (or where `cv_engine` runs) so **`SolarVision`** can load it.

---

## 5. Data Flow Summary

| Step | Component | Input | Output |
|------|-----------|--------|--------|
| 1 | InputAnalysisPanel | User form | FormData → `/api/analyze/full` |
| 2 | Image source | lat, lon **or** file | Image bytes |
| 3 | image_fetcher | lat, lon | Satellite tile bytes |
| 4 | cv_engine | Image bytes | Masks, areas, annotated base64 |
| 5 | solar_engine | Area, lat, lon, district, bill, loan, phase | Financial report |
| 6 | pdf_engine | Report dict + temp image | PDF in `static/` |
| 7 | main.py | All above | JSON (roof_analysis, financial_report, pdf_url) |
| 8 | Insights / Visual / ReportExport | JSON + pdf_url | UI + PDF download |
| 9 | ChatBot | User message | POST `/api/chat` |
| 10 | RAG (Chroma + Gemini) | Message | Answer string |
| 11 | ChatBot | Answer | Rendered in chat UI |

---

## 6. Key Dependencies & Services

- **Backend:** FastAPI, Ultralytics (YOLO), OpenCV, LangChain (Chroma, HuggingFace, Google GenAI), NASA POWER, Esri tiles, FPDF.
- **Frontend:** React, Vite, Axios, Lucide/react-icons.
- **External:** NASA POWER API, Esri World Imagery, Google Gemini API.
- **Local:** Chroma DB, `knowledge_base` PDFs, `best.pt` (YOLO weights).

---

## 7. Quick Start (For Understanding the Workflow)

1. **Knowledge base:**  
   Add PDFs to `knowledge_base/`, run `python build_memory.py` in `backend/`.

2. **YOLO model:**  
   Train via `training/train_model.py`, copy `best.pt` to backend.

3. **Backend:**  
   `cd backend` → `uvicorn main:app --reload` (or equivalent).

4. **Frontend:**  
   `cd frontend` → `npm install` → `npm run dev`.

5. **Use:**  
   - **Analyze:** Fill form (location ± image) → Analyze Project → view insights, overlay, export PDF.  
   - **Chat:** Open chatbot → ask solar/tariff questions → get RAG-backed answers.

---

This describes the **full workflow** of how SOLIX functions from user actions through backend services to results and reports.
