import requests

class SolarCalculator:
    def __init__(self):
        self.base_url = "https://power.larc.nasa.gov/api/temporal/climatology/point"
        self.district_sun_hours = {
            "Colombo": 4.5, "Gampaha": 4.6, "Kalutara": 4.5, "Galle": 4.8,
            "Matara": 4.9, "Hambantota": 5.5, "Jaffna": 5.8, "Kilinochchi": 5.7,
            "Mannar": 5.8, "Vavuniya": 5.6, "Mullaitivu": 5.6, "Batticaloa": 5.4,
            "Ampara": 5.3, "Trincomalee": 5.4, "Kurunegala": 5.0, "Puttalam": 5.2,
            "Anuradhapura": 5.4, "Polonnaruwa": 5.3, "Matale": 4.8, "Kandy": 4.4,
            "Nuwara Eliya": 4.0, "Kegalle": 4.2, "Ratnapura": 4.3, "Badulla": 4.6,
            "Monaragala": 5.0
        }

    def get_solar_data(self, lat, lon, district):
        try:
            params = {
                "parameters": "ALLSKY_SFC_SW_DWN",
                "community": "RE",
                "longitude": lon,
                "latitude": lat,
                "format": "JSON"
            }
            response = requests.get(self.base_url, params=params, timeout=5)
            data = response.json()
            monthly_data = data['properties']['parameter']['ALLSKY_SFC_SW_DWN']
            annual_avg = monthly_data.get('ANN', 5.0)
            return float(annual_avg)
        except:
            return self.district_sun_hours.get(district, 4.5)

    def estimate_usage_from_bill(self, bill_lkr):
        fixed_charge = 1000 
        if bill_lkr <= fixed_charge: return 0
        chargeable = bill_lkr - fixed_charge

        # Heuristic Blended Rates (2025 CEB Estimates)
        if bill_lkr < 5000:
            avg_cost = 25.0 
        elif bill_lkr < 15000:
            avg_cost = 45.0 
        elif bill_lkr < 40000:
            avg_cost = 55.0
        else:
            avg_cost = 65.0 

        return round(chargeable / avg_cost, 1)

    def calculate_loan_installment(self, total_loan_amount, rate_annual, years):
        if total_loan_amount <= 0 or years == 0: return 0
        r = (rate_annual / 100) / 12
        n = years * 12
        return round(total_loan_amount * (r * (1 + r)**n) / ((1 + r)**n - 1), 2)

    def calculate_roi(self, roof_area_m2, annual_irradiance, monthly_bill=0, loan_rate=11.5, loan_years=5, connection_type="Single"):
        # 1. Engineering Potential
        usable_area = roof_area_m2 * 0.7 
        max_roof_capacity_kw = usable_area / 6.0 
        
        # 2. Connection Limit
        if connection_type == "Single":
            phase_limit_kw = 5.0
            phase_warning = " (Limited to 5kW by Single Phase)"
        else:
            phase_limit_kw = 100.0
            phase_warning = ""

        # Effective Max (Roof vs Phase)
        if max_roof_capacity_kw > phase_limit_kw:
            effective_max_kw = phase_limit_kw
            roof_note = f"Roof fits {round(max_roof_capacity_kw,1)}kW, but Phase limit is {phase_limit_kw}kW."
        else:
            effective_max_kw = max_roof_capacity_kw
            roof_note = "Roof capacity is within phase limits."

        # 3. Required System
        if monthly_bill > 0:
            required_units = self.estimate_usage_from_bill(monthly_bill)
            required_system_kw = required_units / 120.0 
            
            if required_system_kw > effective_max_kw:
                recommended_kw = effective_max_kw
                rec_note = f"Warning: You need {round(required_system_kw,1)}kW, but are limited to {effective_max_kw}kW."
            else:
                recommended_kw = required_system_kw
                rec_note = "Success: System meets your full needs."
        else:
            recommended_kw = effective_max_kw
            rec_note = "Based on maximum roof potential."

        if recommended_kw < 1: recommended_kw = 1.0

        # 4. Financials (Standard Day Export)
        monthly_units = recommended_kw * annual_irradiance * 30 * 0.75
        
        # --- FIXED: REAL 2025/2026 RATES ---
        # 0-5kW: 20.90 | 5-20kW: 19.61 | 20-100kW: 17.46
        if recommended_kw <= 5:
            buy_back_rate = 20.90
        elif recommended_kw <= 20:
            buy_back_rate = 19.61
        elif recommended_kw <= 100:
            buy_back_rate = 17.46
        else:
            buy_back_rate = 15.07

        monthly_income = monthly_units * buy_back_rate
        total_cost = recommended_kw * 280000 

        # 5. Financials (Smart Battery / Night Export)
        # Night Peak Rate: Rs 45.80
        battery_rate = 45.80
        # Assume 50% export at day, 50% at night
        battery_monthly_income = (monthly_units * 0.5 * buy_back_rate) + (monthly_units * 0.5 * battery_rate)
        extra_profit = battery_monthly_income - monthly_income
        
        # 6. Loan & Net
        loan_payment = self.calculate_loan_installment(total_cost, loan_rate, loan_years)
        net_result = monthly_income - loan_payment

        return {
            "system_capacity_kw": round(recommended_kw, 2),
            "recommended_system_kw": round(recommended_kw, 2),
            "max_roof_capacity_kw": round(max_roof_capacity_kw, 2),
            "effective_max_kw": round(effective_max_kw, 2),
            
            "monthly_generation_kwh": round(monthly_units, 2),
            "tariff_rate": buy_back_rate, # Now correctly returns 20.90, 19.61 etc.
            
            "monthly_earning_lkr": round(monthly_income, 2),
            "normal_monthly_income": round(monthly_income, 2),
            
            "battery_monthly_earning": round(battery_monthly_income, 2),
            "battery_extra_profit": round(extra_profit, 2),
            
            "total_investment_lkr": round(total_cost, 2),
            "payback_period": round(total_cost / (monthly_income * 12), 1) if monthly_income > 0 else 0,
            
            "loan_installment": loan_payment,
            "net_monthly_result": round(net_result, 2),
            "note": rec_note + phase_warning
        }