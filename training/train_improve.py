from ultralytics import YOLO

def train_improve_model():
    # 1. Load your CURRENT best model
    # Instead of starting from scratch ('yolov8n-seg.pt'), we start from where you left off.
    # Make sure 'best.pt' is in the folder above this script (backend/), or update the path.
    print("🚀 Loading your existing best.pt model...")
    try:
        model = YOLO('best.pt') 
    except:
        print("⚠️ Could not find '../best.pt'. Starting from scratch with 'yolov8n-seg.pt'")
        model = YOLO('yolov8n-seg.pt')

    # 2. Train with ADVANCED AUGMENTATION
    # These settings are the key to better accuracy for satellite images.
    print("🚀 Starting Advanced Training...")
    results = model.train(
        data='data.yaml',  # Path to your dataset config
        epochs=50,            # 50 more epochs is usually enough to refine it
        imgsz=640,            # Keep 640 for speed, or use 1024 if you have a GPU
        device='cpu',         # Keep 'cpu' (or change to 0 if you have GPU)
        
        # --- THE IMPROVEMENTS (Data Augmentation) ---
        degrees=180,      # ROOF ROTATION: Roofs can face any direction. This checks 360°.
        flipud=0.5,       # UPSIDE DOWN: Satellite maps have no "up". This flips images 50% of the time.
        fliplr=0.5,       # LEFT-RIGHT: Flips images horizontally.
        mosaic=1.0,       # MOSAIC: Stitches 4 images into 1. Helps detect small objects (chimneys) in context.
        hsv_h=0.015,      # COLOR: Changes hue slightly (handles morning vs afternoon sun).
        hsv_s=0.7,        # SATURATION: Handles bright vs dull images.
        hsv_v=0.4,        # BRIGHTNESS: Handles cloudy vs sunny days.
        
        project='../solar_agent_outputs',
        name='sri_lanka_roof_improved'
    )

    # 3. Export
    model.export(format='onnx')
    print("✅ Training Complete! Your new best model is in 'backend/solar_agent_outputs/sri_lanka_roof_improved/weights/best.pt'")

if __name__ == '__main__':
    train_improve_model()