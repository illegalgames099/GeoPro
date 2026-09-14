import urllib.request
import urllib.error
import json

coords = "-73.9851,40.7589;-73.9665,40.7812"

try:
    print("Testing bike port with driving profile:")
    req = urllib.request.urlopen(f"https://routing.openstreetmap.de/routed-bike/route/v1/driving/{coords}")
    res = json.loads(req.read())
    print("Driving profile distances:", res["routes"][0]["distance"])
    print("Driving profile duration:", res["routes"][0]["duration"])
except Exception as e:
    print("Error:", e)
