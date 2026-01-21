from fpdf import FPDF
import os

class ReportGenerator(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.cell(0, 10, 'Solar Potential Assessment Report', 0, 1, 'C')
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

def generate_solar_pdf(data, image_path, filename="report.pdf"):
    pdf = ReportGenerator()
    pdf.add_page()
    
    # --- Section 1: Project Details ---
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt=f"Location: {data['district']} District", ln=True)
    pdf.cell(200, 10, txt=f"Generated on: 2025-12-20", ln=True) # Static date for demo
    pdf.ln(10)

    # --- Section 2: Roof Image ---
    pdf.set_font("Arial", 'B', size=14)
    pdf.cell(200, 10, txt="1. Roof Analysis", ln=True)
    
    if os.path.exists(image_path):
        pdf.image(image_path, x=10, w=100) # Draw the image
        pdf.ln(85) # Move cursor down below image
    else:
        pdf.cell(200, 10, txt="[Image not found]", ln=True)

    pdf.set_font("Arial", size=11)
    pdf.cell(200, 8, txt=f"Detected Roof Area: {data['roof_area']} sq meters", ln=True)
    pdf.ln(10)

    # --- Section 3: Technical Potential ---
    pdf.set_font("Arial", 'B', size=14)
    pdf.cell(200, 10, txt="2. Energy Potential", ln=True)
    pdf.set_font("Arial", size=11)
    
    pdf.cell(200, 8, txt=f"Recommended System Size: {data['system_size']} kW", ln=True)
    pdf.cell(200, 8, txt=f"Estimated Generation: {data['generation']} kWh (Units) per month", ln=True)
    pdf.ln(10)

    # --- Section 4: Financials (CEB) ---
    pdf.set_fill_color(240, 240, 240) # Grey background
    pdf.rect(10, pdf.get_y(), 190, 40, 'F') # Draw box
    
    pdf.set_font("Arial", 'B', size=14)
    pdf.cell(200, 10, txt="3. Financial Projection (CEB Net Plus)", ln=True)
    
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 8, txt=f"CEB Buy-Back Rate: LKR {data['tariff_rate']} per Unit", ln=True)
    pdf.set_text_color(0, 100, 0) # Green color for money
    pdf.cell(200, 8, txt=f"Monthly Earnings: LKR {data['earnings']}", ln=True)
    pdf.set_text_color(0, 0, 0) # Reset color
    pdf.cell(200, 8, txt=f"Payback Period: {data['payback']} Years", ln=True)

    # Save
    output_path = f"static/{filename}"
    os.makedirs("static", exist_ok=True)
    pdf.output(output_path)
    return output_path