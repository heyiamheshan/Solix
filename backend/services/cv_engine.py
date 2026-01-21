from ultralytics import YOLO
import cv2
import numpy as np
import base64

class SolarVision:
    def __init__(self):
        self.model = YOLO("best.pt") 
    
    def analyze_image(self, image_bytes):
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        results = self.model(img)
        result = results[0]

        detected_objects = []
        
        if result.masks:
            for i, mask in enumerate(result.masks.data):
                mask_np = mask.cpu().numpy()
                pixel_area = np.sum(mask_np)
                
                # --- FIX 1: Correct Scale Factor ---
                # Zoom Level 19 Satellite Imagery is approx 0.298 meters/pixel at the equator.
                # Area = 0.298 * 0.298 = 0.089 m^2 per pixel.
                # Your previous 0.05 was underestimating area by ~45%.
                real_world_area = float(pixel_area) * 0.09 

                detected_objects.append({
                    "id": i,
                    "pixel_area": float(pixel_area),
                    "estimated_m2": real_world_area 
                })

        annotated_img = result.plot()
        _, encoded_img = cv2.imencode('.jpg', annotated_img)
        img_base64 = base64.b64encode(encoded_img).decode('utf-8')

        return {
            "detection_count": len(detected_objects),
            "objects": detected_objects,
            "annotated_image": img_base64
        }