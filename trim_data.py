import os
import shutil

DATA_DIR = "data"
EXTRA_DIR = "data_extra"   # extra images are MOVED here, not deleted
KEEP = 100                 # images to keep per letter

for label in sorted(os.listdir(DATA_DIR)):
    src = os.path.join(DATA_DIR, label)
    if not os.path.isdir(src):
        continue
    files = sorted(os.listdir(src))
    extra = files[KEEP:]
    if extra:
        dst = os.path.join(EXTRA_DIR, label)
        os.makedirs(dst, exist_ok=True)
        for f in extra:
            shutil.move(os.path.join(src, f), os.path.join(dst, f))
    print(label, "kept", min(len(files), KEEP), "moved", len(extra))

print("Done. Training set is now small and fast.")