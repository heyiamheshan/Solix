from fastapi import FastAPI, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from services.cv_engine import SolarVision
from services.solar_engine import SolarCalculator
from services.pdf_engine import generate_solar_pdf
from services.image_fetcher import fetch_satellite_image
import base64
import os

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

# CORS (Allow Frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

vision_engine = SolarVision()
solar_engine = SolarCalculator()

@app.post("/api/analyze/full")
async def analyze_full_project(
    district: str = Form(...),
    lat: float = Form(...),
    lon: float = Form(...),
    bill: float = Form(0),
    loan_rate: float = Form(11.5),
    loan_years: int = Form(5),
    phase: str = Form("Single"),
    file: UploadFile = File(None)
):
    # 1. GET THE IMAGE
    if file:
        image_data = await file.read()
    else:
        print(f"Fetching satellite image for {lat}, {lon}...")
        image_data = fetch_satellite_image(lat, lon)
        if not image_data:
            return {"status": "error", "message": "Could not fetch satellite image for this location."}

    # 2. CV Analysis
    cv_results = vision_engine.analyze_image(image_data)
    
    # Save image for PDF
    os.makedirs("static", exist_ok=True)
    temp_img_path = "static/temp_roof.jpg"
    with open(temp_img_path, "wb") as f:
        f.write(base64.b64decode(cv_results['annotated_image']))

    # 3. Solar & Financial Math
    detected_area = sum([obj['estimated_m2'] for obj in cv_results['objects']])
    
    # --- LOGIC FIX: Fallback & Flagging ---
    if detected_area > 0:
        total_area_m2 = detected_area
        is_estimated = False
    else:
        total_area_m2 = 60.0 # Default fallback
        is_estimated = True

    irradiance = solar_engine.get_solar_data(lat, lon, district)
    
    financials = solar_engine.calculate_roi(
        total_area_m2, 
        irradiance, 
        monthly_bill=bill, 
        loan_rate=loan_rate, 
        loan_years=loan_years,
        connection_type=phase
    )
    
    # 4. Generate PDF
    pdf_data = {
        "district": district,
        "roof_area": round(total_area_m2, 2),
        "system_size": financials["recommended_system_kw"], 
        "generation": financials["monthly_generation_kwh"],
        "tariff_rate": financials["tariff_rate"],
        "earnings": financials["normal_monthly_income"],
        "payback": financials["payback_period"],
        "battery_earnings": financials.get("battery_monthly_earning", 0),
        "extra_profit": financials.get("battery_extra_profit", 0),
        "cost_normal": financials["total_investment_lkr"],
        "cost_hybrid": financials.get("total_investment_hybrid", 0)
    }
    
    pdf_filename = f"Solar_Report_{district}.pdf"
    generate_solar_pdf(pdf_data, temp_img_path, pdf_filename)

    # --- CRITICAL FIX: Merge the calculated area into the response ---
    final_roof_analysis = {
        **cv_results,                            # Include the original detection objects
        "total_area_m2": round(total_area_m2, 2), # <--- THIS was missing!
        "is_estimated": is_estimated              # <--- THIS was missing!
    }

    return {
        "status": "success",
        "roof_analysis": final_roof_analysis,     # Send the MERGED dictionary
        "financial_report": financials,
        "pdf_url": f"http://127.0.0.1:8000/static/{pdf_filename}"
    }