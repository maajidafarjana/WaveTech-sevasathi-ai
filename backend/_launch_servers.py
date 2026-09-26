import subprocess, sys, time, os, urllib.request, signal

BASE = r"d:\WaveTech-sevasathi-ai"
BACKEND_DIR = os.path.join(BASE, "backend")
FRONTEND_DIR = os.path.join(BASE, "seva-saathi-frontend")
PY = os.path.join(BACKEND_DIR, "venv", "Scripts", "python.exe")
UVICORN = os.path.join(BACKEND_DIR, "venv", "Scripts", "uvicorn.exe")
BACKEND_LOG = os.path.join(BACKEND_DIR, "backend.log")
FRONTEND_LOG = os.path.join(FRONTEND_DIR, "frontend.log")

DETACHED = 0x00000008 if os.name == 'nt' else 0

def start_backend():
    with open(BACKEND_LOG, "w") as lf:
        return subprocess.Popen(
            [UVICORN, "main:app", "--host", "127.0.0.1", "--port", "5000"],
            cwd=BACKEND_DIR, stdout=lf, stderr=lf,
            creationflags=DETACHED
        )

def start_frontend():
    npm = r"C:\Program Files\nodejs\npm.cmd"
    if not os.path.exists(npm):
        for candidate in [r"C:\Program Files\nodejs\npm.cmd",
                          os.path.expandvars(r"%APPDATA%\npm\npm.cmd")]:
            if os.path.exists(candidate):
                npm = candidate
                break
    with open(FRONTEND_LOG, "w") as lf:
        return subprocess.Popen(
            [npm, "run", "dev"],
            cwd=FRONTEND_DIR, stdout=lf, stderr=lf,
            creationflags=DETACHED,
            env={**os.environ, "FORCE_COLOR": "0"}
        )

def check(url, timeout=3):
    try:
        r = urllib.request.urlopen(url, timeout=timeout)
        return True, r.status, r.read().decode('utf-8', errors='replace')[:500]
    except Exception as e:
        return False, 0, str(e)

if __name__ == "__main__":
    print("Starting BACKEND on :5000 ...", flush=True)
    pb = start_backend()
    print("Starting FRONTEND on :5173 ...", flush=True)
    pf = start_frontend()
    for i in range(1, 16):
        time.sleep(1.5)
        print(f"[{i}/15] Checking endpoints...", flush=True)
        ok_b, code_b, body_b = check("http://127.0.0.1:5000/api/health")
        ok_s, code_s, _ = check("http://127.0.0.1:5000/api/scholarships/")
        ok_g, code_g, _ = check("http://127.0.0.1:5000/api/grievances/")
        ok_f, code_f, body_f = check("http://127.0.0.1:5173/", timeout=5)
        print(f"  BACKEND health:   {'OK ' + str(code_b) if ok_b else 'FAIL - ' + body_b[:80]}", flush=True)
        print(f"  BACKEND scholars: {'OK ' + str(code_s) if ok_s else 'FAIL'}", flush=True)
        print(f"  BACKEND grievan: {'OK ' + str(code_g) if ok_g else 'FAIL'}", flush=True)
        print(f"  FRONTEND vite:    {'OK ' + str(code_f) if ok_f else 'WAIT - ' + body_f[:100]}", flush=True)
        if ok_b and ok_s and ok_g and ok_f:
            print("\n================================================", flush=True)
            print("  🚀 BOTH SERVERS RUNNING SUCCESSFULLY!", flush=True)
            print("  Frontend: http://localhost:5173", flush=True)
            print("  Backend:  http://localhost:5000", flush=True)
            print("================================================\n", flush=True)
            if ok_b:
                print("  /api/health => " + body_b[:200], flush=True)
            # Exit launcher, servers remain running as detached processes
            sys.exit(0)
    print("\n[WARN] Timed out waiting for servers. Check log files:", flush=True)
    for p in [BACKEND_LOG, FRONTEND_LOG]:
        if os.path.exists(p):
            sz = os.path.getsize(p)
            print(f"  {p} ({sz} bytes)", flush=True)
            if sz > 0:
                with open(p, "r", errors='replace') as f:
                    print(f.read()[-1200:], flush=True)
