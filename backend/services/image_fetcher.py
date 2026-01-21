import math
import requests
from PIL import Image
from io import BytesIO

# Mathematical magic to convert Lat/Lon to "Tile Coordinates" (Web Mercator)
def deg2num(lat_deg, lon_deg, zoom):
    lat_rad = math.radians(lat_deg)
    n = 2.0 ** zoom
    xtile = int((lon_deg + 180.0) / 360.0 * n)
    ytile = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
    return (xtile, ytile)

def fetch_satellite_image(lat, lon, zoom=19):
    """
    Downloads the satellite image for a specific lat/lon from Esri World Imagery.
    """
    xtile, ytile = deg2num(lat, lon, zoom)
    
    # Esri World Imagery URL (Free to use for education)
    url = f"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{zoom}/{ytile}/{xtile}"
    
    try:
        # 1. Download the image tile
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            # 2. Return the image bytes
            return response.content
        else:
            print(f"Error downloading tile: Status {response.status_code}")
            return None
    except Exception as e:
        print(f"Error fetching image: {e}")
        return None