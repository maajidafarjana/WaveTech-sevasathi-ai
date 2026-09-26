import subprocess, os, time, urllib.request, sys

BACKEND_DIR = r"d:\WaveTech-sevasathi-ai\backend"
os.chdir(BACKEND_DIR)
UV = os.path.join(BACKEND_DIR, "venv", "Scripts", "uvicorn.exe")
LOG_OUT = os.path.join(BACKEND_DIR, "backend_out.log")
LOG_ERR = os.path.join(BACKEND_DIR, "backend_err.log")

fo = open(LOG_OUT, "w")
fe = open(LOG_ERR, "w")
p = subprocess.Popen([UV, "main:app", "--host", "127.0.0.1", "--port", "5000"],
                     stdout=fo, stderr=fe)
print(f"[launcher] Backend PID={p.pid} starting on port 5000...", flush=True)

for i in range(10):
    time.sleep(1.2)
    try:
        r = urllib.request.urlopen("http://127.0.0.1:5000/api/health", timeout=3)
        body = r.read().decode()
        print(f"[launcher] BACKEND OK after {(i+1)*1.2:.1f}s: " + body, flush=True)
        for ep, nm in [("/api/scholarships/", "scholarships"), ("/api/grievances/", "grievances")]:
            try:
                r2 = urllib.request.urlopen("http://127.0.0.1:5000" + ep, timeout=3)
                d = r2.read().decode()
                print(f"[launcher] {nm}: " + d[:160], flush=True)
            except Exception as e2:
                print(f"[launcher] {nm} FAIL: {e2}", flush=True)
        print("\n=== BACKEND RUNNING ON http://localhost:5000 ===", flush=True)
        # Don't kill; exit and leave detached-ish running
        sys.exit(0)
    except Exception as e:
        print(f"[launcher] wait {i+1}/10 ... {str(e)[:60]}", flush=True)
        if p.poll() is not None:
            print(f"[launcher] BACKEND CRASHED exit={p.returncode}", flush=True)
            try:
                fe.flush(); fo.flush()
            except Exception: pass
            break

print("[launcher] stderr tail:", flush=True)
try:
    fe.flush()
    with open(LOG_ERR, "r", errors="replace") as f:
        print(f.read()[-1500:], flush=True)
except Exception as e:
    print(e)
sys.exit(1)
