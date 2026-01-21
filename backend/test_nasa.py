import requests

def test_nasa_connection():
    print("------------------------------------------------")
    print("🚀 STARTING NASA API DIAGNOSTIC TEST")
    print("------------------------------------------------")

    url = "https://power.larc.nasa.gov/api/temporal/climatology/point"
    params = {
        "parameters": "ALLSKY_SFC_SW_DWN",
        "community": "RE",
        "longitude": 79.8612,  # Colombo Longitude
        "latitude": 6.9271,    # Colombo Latitude
        "format": "JSON"
    }

    print(f"📡 Attempting to connect to: {url}")
    print("⏳ Waiting for response (timeout 10s)...")

    try:
        response = requests.get(url, params=params, timeout=10)
        
        print(f"✅ Response Received! Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            irradiance = data['properties']['parameter']['ALLSKY_SFC_SW_DWN']['ANN']
            print(f"🌞 SUCCESS! Solar Irradiance retrieved: {irradiance} kWh/m²/day")
        else:
            print(f"❌ API Error: {response.text}")

    except Exception as e:
        print("------------------------------------------------")
        print("❌ CONNECTION FAILED")
        print(f"Error Details: {e}")
        print("------------------------------------------------")
        print("Possible fixes:")
        print("1. Check your internet connection.")
        print("2. If you are on university/office Wi-Fi, they might block this API.")

if __name__ == "__main__":
    test_nasa_connection()