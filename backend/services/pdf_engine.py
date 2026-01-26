from fpdf import FPDF
import os
from datetime import datetime

class ReportGenerator(FPDF):
    def header(self):
        # Logo
        # Assuming logo.png is in the static directory or a known path
        # if os.path.exists("static/logo.png"):
        #     self.image("static/logo.png", 10, 8, 33)
        # Arial bold 15
        self.set_font('Arial', 'B', 15)
        # Move to the right
        self.cell(80)
        # Title
        self.cell(30, 10, 'Solar Potential Assessment Report', 0, 1, 'C')
        # Line break
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.set_text_color(128) # Grey text for footer
        self.cell(0, 10, f'Page {self.page_no()}/{{nb}}', 0, 0, 'C')

    def add_chapter_title(self, title):
        self.set_font('Arial', 'B', 14)
        self.set_fill_color(220, 230, 240) # Light blue-grey background
        self.cell(0, 10, title, 0, 1, 'L', 1) # Cell with background
        self.ln(5)

def generate_solar_pdf(data, image_path, filename="report.pdf"):
    pdf = ReportGenerator()
    pdf.add_page()
    
    # --- Section 1: Project Details ---
    pdf.add_chapter_title("1. Project Details")
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt=f"Location: {data['district']} District", ln=True)
    pdf.cell(200, 10, txt=f"Generated on: {datetime.now().strftime('%Y-%m-%d')}", ln=True)
    pdf.ln(10)

    # --- Section 2: Roof Image ---
    pdf.add_chapter_title("2. Roof Analysis")
    
    if os.path.exists(image_path):
        pdf.image(image_path, x=10, w=100) # Draw the image
        pdf.ln(85) # Move cursor down below image
    else:
        pdf.cell(200, 10, txt="[Image not found]", ln=True)

    pdf.set_font("Arial", size=11)
    pdf.cell(200, 8, txt=f"Detected Roof Area: {data['roof_area']} sq meters", ln=True)
    pdf.ln(10)

    # --- Section 3: Technical Potential ---
    pdf.add_chapter_title("3. Energy Potential")
    pdf.set_font("Arial", size=11)
    
    pdf.cell(200, 8, txt=f"Recommended System Size: {data['system_size']} kW", ln=True)
    pdf.cell(200, 8, txt=f"Estimated Generation: {data['generation']} kWh (Units) per month", ln=True)
    pdf.ln(10)

    # --- Section 4: Financials (CEB) ---
    pdf.add_chapter_title("4. Financial Projection (CEB Net Plus)")
    
    pdf.set_font("Arial", size=12)
    
    # Financial data in a structured way
    pdf.set_font("Arial", 'B', size=12)
    pdf.cell(80, 8, "CEB Buy-Back Rate:", 0, 0, 'L')
    pdf.set_font("Arial", size=12)
    pdf.cell(0, 8, f"LKR {data['tariff_rate']} per Unit", 0, 1, 'L')

    pdf.set_font("Arial", 'B', size=12)
    pdf.cell(80, 8, "Monthly Earnings:", 0, 0, 'L')
    pdf.set_font("Arial", size=12)
    pdf.set_text_color(0, 100, 0) # Green color for money
    pdf.cell(0, 8, f"LKR {data['earnings']}", 0, 1, 'L')
    pdf.set_text_color(0, 0, 0) # Reset color

    pdf.set_font("Arial", 'B', size=12)
    pdf.cell(80, 8, "Payback Period:", 0, 0, 'L')
    pdf.set_font("Arial", size=12)
    pdf.cell(0, 8, f"{data['payback']} Years", 0, 1, 'L')

    pdf.ln(10) # Add some space after financials

    # Save
    output_path = f"static/{filename}"
    os.makedirs("static", exist_ok=True)
    pdf.output(output_path)
    return output_path