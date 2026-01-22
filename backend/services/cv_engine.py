from ultralytics import YOLO
import cv2
import numpy as np
import base64

class SolarVision:
    def __init__(self):
        # Load the model once
        self.model = YOLO("best.pt") 

    def validate_image(self, img):
        """
        Checks if the image is too cloudy or blurry.
        Returns: (bool, str) -> (is_valid, reason)
        """
        # 1. Cloud Check (White Pixel Ratio)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        white_pixels = np.sum(gray > 200) # Count very bright pixels
        total_pixels = gray.size
        if (white_pixels / total_pixels) > 0.45: # If > 45% white
            return False, "Image is too cloudy"

        # 2. Blur Check (Laplacian Variance)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        if laplacian_var < 50: # Threshold for blur
            return False, "Image is too blurry"

        return True, "OK"

    def analyze_image(self, image_bytes):
        # Convert bytes to Image
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # --- STEP 1: Pre-check Quality ---
        is_valid, reason = self.validate_image(img)
        if not is_valid:
            # Return empty result with error warning if bad image
            print(f"⚠️ Image Rejected: {reason}")
            return {
                "detection_count": 0,
                "objects": [],
                "annotated_image": base64.b64encode(image_bytes).decode('utf-8'),
                "warning": reason
            }

        # --- STEP 2: Advanced Inference (The Accuracy Fix) ---
        # augment=True: Flips/rotates image internally to find more objects
        # imgsz=1024: Upscales image to detect small objects (chimneys/vents)
        # conf=0.15: Lowers threshold slightly to catch faint panels
        results = self.model(img, augment=True, imgsz=1024, conf=0.15)
        result = results[0]

        detected_objects = []
        
        # --- STEP 3: Process Results ---
        if result.masks:
            for i, mask in enumerate(result.masks.data):
                # Move to CPU and convert to numpy
                mask_np = mask.cpu().numpy()
                
                # Resize mask back to original image size (YOLO masks are smaller)
                mask_resized = cv2.resize(mask_np, (img.shape[1], img.shape[0]), interpolation=cv2.INTER_NEAREST)
                
                pixel_area = np.sum(mask_resized)
                
                # Area Calculation (0.09 m^2 per pixel at Zoom 19)
                real_world_area = float(pixel_area) * 0.09 

                detected_objects.append({
                    "id": i,
                    "pixel_area": float(pixel_area),
                    "estimated_m2": real_world_area 
                })

        # Generate Annotated Image
        annotated_img = result.plot()
        _, encoded_img = cv2.imencode('.jpg', annotated_img)
        img_base64 = base64.b64encode(encoded_img).decode('utf-8')

        return {
            "detection_count": len(detected_objects),
            "objects": detected_objects,
            "annotated_image": img_base64
        }