from ultralytics import YOLO

def train_sri_lanka_roof_model():
    # 1. Load the model
    # We start with 'yolov8n-seg.pt' (Nano Segmentation)
    # It transfers the knowledge of "objects" to our specific "roofs"
    model = YOLO('yolov8n-seg.pt')

    # 2. Train the model
    # epochs=100: How many times it studies the data
    # imgsz=640: Standard image size
    # device='cpu': Change to 0 if you have an NVIDIA GPU
    results = model.train(
        data='data.yaml',
        epochs=50, 
        imgsz=640,
        device='cpu',
        project='solar_agent_outputs',
        name='sri_lanka_roof_v1'
    )

    # 3. Export the model
    # This creates 'best.pt' which you will later move to your backend
    model.export(format='onnx')

if __name__ == '__main__':
    train_sri_lanka_roof_model()