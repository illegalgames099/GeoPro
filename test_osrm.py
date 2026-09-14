import urllib.request
import urllib.error
import json

coords = "-73.9851,40.7589;-73.9665,40.7812"

try:
    print("Testing foot port with driving profile:")
    req = urllib.request.urlopen(f"https://routing.openstreetmap.de/routed-foot/route/v1/driving/{coords}")
    res = json.loads(req.read())
    print("OK:", res["code"])
except Exception as e:
    print("Error:", e)

try:
    print("\nTesting foot port with foot profile:")
    req = urllib.request.urlopen(f"https://routing.openstreetmap.de/routed-foot/route/v1/foot/{coords}")
    res = json.loads(req.read())
    print("OK:", res["code"])
except urllib.error.HTTPError as e:
    print("Error:", e.code, e.read().decode())
except Exception as e:
    print("Error:", e)
