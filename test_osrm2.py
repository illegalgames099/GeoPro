import urllib.request
import urllib.error
import json

coords = "-73.9851,40.7589;-73.9665,40.7812"

try:
    print("\nTesting foot port with walking profile:")
    req = urllib.request.urlopen(f"https://routing.openstreetmap.de/routed-foot/route/v1/walking/{coords}")
    res = json.loads(req.read())
    print("OK:", res["code"])
except urllib.error.HTTPError as e:
    print("Error:", e.code, e.read().decode())
except Exception as e:
    print("Error:", e)
