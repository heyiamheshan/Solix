import google.generativeai as genai

# --- PASTE YOUR KEY HERE ---
MY_API_KEY = "AIzaSyBhnRAv-e2THGjVnhYs9bi670FTfGdfbY4"

try:
    genai.configure(api_key=MY_API_KEY)
    print("✅ Authentication Successful! Checking available models...\n")
    
    found_any = False
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"AVAILABLE: {m.name}")
            found_any = True
            
    if not found_any:
        print("❌ No models found. Your API Key might be valid but has no access.")
        print("   Please create a new key at: https://aistudio.google.com/")

except Exception as e:
    print(f"❌ Error: {e}")