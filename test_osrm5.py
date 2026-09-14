import urllib.request
import urllib.error
import json

coords = "-73.9851,40.7589;-73.9665,40.7812"

try:
    print("Testing foot port with driving profile:")
    req = urllib.request.urlopen(f"https://routing.openstreetmap.de/routed-foot/route/v1/driving/{coords}")
    res = json.loads(req.read())
    print("Driving profile distances:", res["routes"][0]["distance"])
    print("Driving profile duration:", res["routes"][0]["duration"])
except Exception as e:
    print("Error:", e)

try:
    print("\nTesting car port with driving profile:")
    req = urllib.request.urlopen(f"https://routing.openstreetmap.de/routed-car/route/v1/driving/{coords}")
    res = json.loads(req.read())
    print("Car port Driving profile distances:", res["routes"][0]["distance"])
    print("Car port Driving profile duration:", res["routes"][0]["duration"])
except urllib.error.HTTPError as e:
    print("Error:", e.code, e.read().decode())
except Exception as e:
    print("Error:", e)
