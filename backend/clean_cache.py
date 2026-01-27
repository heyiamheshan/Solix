import shutil
import os
from pathlib import Path

def clean_huggingface_cache():
    # Find the user's home directory
    home = Path.home()
    
    # Define the cache path on Windows
    cache_dir = home / ".cache" / "huggingface"
    
    print(f"🧹 Looking for cache at: {cache_dir}")
    
    if cache_dir.exists():
        print("   Found cache! Deleting corrupted files...")
        try:
            shutil.rmtree(cache_dir)
            print("✅ Cache deleted successfully.")
        except Exception as e:
            print(f"❌ Error deleting cache: {e}")
            print("   Please manually delete the folder: C:\\Users\\Asus\\.cache\\huggingface")
    else:
        print("   Cache folder not found (already clean).")

if __name__ == "__main__":
    clean_huggingface_cache()