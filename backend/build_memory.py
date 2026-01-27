import os
import time
from langchain_community.document_loaders import PyPDFLoader, WebBaseLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings # <--- NEW: Local Embeddings

# --- SETTINGS ---
os.environ["USER_AGENT"] = "SOLIX_SOLAR_BOT/1.0"
# Note: We don't need the Google API Key for this step anymore!

# List of Websites
URLS_TO_SCRAPE = [
    "https://www.pucsl.gov.lk/electricity/tariff/electricity-tariff-and-charges/",
    "https://www.pucsl.gov.lk/electricity/tariff/domestic/",
    "https://www.pucsl.gov.lk/rooftop-solar-pv-connection-schemes/",
    "https://www.energy.gov.lk/en/soorya-bala-sangramaya",
    "https://www.energy.gov.lk/en/renewable-energy/technologies/solar-energy",
    "https://www.energy.gov.lk/en/",
    "https://www.ceb.lk/",
    "https://www.ceb.lk/renewable-energy/en"
]

DATA_FOLDER = "knowledge_base"
DB_PATH = "chroma_db"

def build_database():
    print("🚀 STARTING: Building AI Memory (Local CPU Mode)...")
    
    documents = []

    # --- PART A: LOAD PDFs ---
    if os.path.exists(DATA_FOLDER):
        pdf_files = [f for f in os.listdir(DATA_FOLDER) if f.endswith('.pdf')]
        print(f"📂 Found {len(pdf_files)} PDF files.")
        for pdf in pdf_files:
            try:
                loader = PyPDFLoader(os.path.join(DATA_FOLDER, pdf))
                documents.extend(loader.load())
            except Exception as e:
                print(f"   ❌ Skipped {pdf}: {e}")
    
    # --- PART B: LOAD URLs ---
    print(f"🌐 Scraping {len(URLS_TO_SCRAPE)} websites...")
    for url in URLS_TO_SCRAPE:
        try:
            loader = WebBaseLoader(url)
            documents.extend(loader.load())
        except Exception as e:
            print(f"   ❌ Skipped {url}")

    if not documents:
        print("❌ No documents found.")
        return

    # --- PART C: SPLIT TEXT ---
    print("✂️  Splitting text...")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = text_splitter.split_documents(documents)
    print(f"   - Created {len(chunks)} chunks.")

    # --- PART D: SAVE WITH LOCAL EMBEDDINGS ---
    print("💾 Generating Embeddings on CPU (No API Limits)...")
    
    # Using a standard, efficient local model
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    # Initialize DB and save all at once (Local is fast!)
    vector_db = Chroma.from_documents(
        documents=chunks, 
        embedding=embeddings, 
        persist_directory=DB_PATH
    )

    print("✅ SUCCESS! AI Memory built at 'backend/chroma_db'")

if __name__ == "__main__":
    build_database()