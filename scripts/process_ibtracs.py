#!/usr/bin/env python3
"""
IBTrACS processor — downloads WP + NA basin CSVs, filters storms near
Manila / Miami / Tokyo, outputs GeoJSON track files and H3 risk grids.
"""

import csv, json, math, os, sys, urllib.request, io, gzip
from collections import defaultdict

# ── City config ────────────────────────────────────────────────────────────────
CITIES = {
    "manila": {
        "basin": "WP",
        "lat": 14.5547, "lng": 120.9932,
        "bbox": (10.0, 116.0, 22.0, 128.0),   # minLat, minLng, maxLat, maxLng
        "radius_km": 600,
        "h3_bbox": [[14.49, 120.93], [14.63, 121.05]],
    },
    "miami": {
        "basin": "NA",
        "lat": 25.7617, "lng": -80.1918,
        "bbox": (20.0, -88.0, 32.0, -72.0),
        "radius_km": 600,
        "h3_bbox": [[25.72, -80.28], [25.82, -80.12]],
    },
    "tokyo": {
        "basin": "WP",
        "lat": 35.6305, "lng": 139.7924,
        "bbox": (28.0, 132.0, 42.0, 148.0),
        "radius_km": 600,
        "h3_bbox": [[35.58, 139.73], [35.68, 139.85]],
    },
}

BASIN_URLS = {
    "WP": "https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r01/access/csv/ibtracs.WP.list.v04r01.csv",
    "NA": "https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r01/access/csv/ibtracs.NA.list.v04r01.csv",
}

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "data")
STORMS_DIR = os.path.join(OUT_DIR, "storms")
RISK_DIR = os.path.join(OUT_DIR, "risk-grid")

os.makedirs(STORMS_DIR, exist_ok=True)
os.makedirs(RISK_DIR, exist_ok=True)

# H3 resolution 8 approximate cell side ~0.46km, avg area ~0.74km²
H3_RES8_STEP = 0.004  # degrees ≈ 0.44km, used to build grid centroid list


def haversine_km(lat1, lng1, lat2, lng2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))


def download_csv(url):
    fname = url.split("/")[-1]
    cached = f"/tmp/{fname.replace('ibtracs.', 'ibtracs_').replace('.list.v04r01.csv', '.csv')}"
    if os.path.exists(cached):
        print(f"  Using cached {cached}", flush=True)
        with open(cached, "r", encoding="utf-8", errors="replace") as f:
            return f.read()
    print(f"  Downloading {fname} ...", flush=True)
    req = urllib.request.Request(url, headers={"User-Agent": "GeoPricer/1.0"})
    import ssl
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    with urllib.request.urlopen(req, timeout=300, context=ctx) as resp:
        data = resp.read()
    print(f"  Downloaded {len(data)//1024//1024} MB", flush=True)
    return data.decode("utf-8", errors="replace")


def parse_ibtracs(csv_text, city_name, cfg):
    """
    Parse IBTrACS CSV, filter tracks affecting this city.
    Returns list of storm dicts: {sid, name, year, season, points:[{lat,lng,wind_kt}]}
    """
    minLat, minLng, maxLat, maxLng = cfg["bbox"]
    clat, clng = cfg["lat"], cfg["lng"]
    radius = cfg["radius_km"]

    reader = csv.reader(io.StringIO(csv_text))

    # Skip 2 header rows (IBTrACS has row 1 = colnames, row 2 = units)
    header = next(reader)
    units = next(reader)

    # Column indices
    try:
        i_sid   = header.index("SID")
        i_name  = header.index("NAME")
        i_year  = header.index("SEASON")
        i_lat   = header.index("LAT")
        i_lon   = header.index("LON")
        i_wind  = header.index("WMO_WIND")   # max sustained wind kt
        i_pres  = header.index("WMO_PRES")   # central pressure hPa
    except ValueError as e:
        print(f"  Column not found: {e}")
        print(f"  Available: {header[:20]}")
        sys.exit(1)

    storms = {}  # sid → storm dict

    for row in reader:
        if len(row) < max(i_sid, i_name, i_year, i_lat, i_lon, i_wind) + 1:
            continue
        try:
            lat = float(row[i_lat])
            lng = float(row[i_lon])
        except ValueError:
            continue

        # Quick bbox pre-filter
        if not (minLat <= lat <= maxLat and minLng <= lng <= maxLng):
            continue

        sid = row[i_sid].strip()
        if not sid:
            continue

        try:
            wind_kt = float(row[i_wind]) if row[i_wind].strip() else 0.0
        except ValueError:
            wind_kt = 0.0

        try:
            year = int(row[i_year].strip())
        except ValueError:
            year = 0

        name = row[i_name].strip() or "UNNAMED"

        if sid not in storms:
            storms[sid] = {"sid": sid, "name": name, "year": year, "peak_kt": 0, "points": []}

        storms[sid]["points"].append({"lat": lat, "lng": lng, "wind_kt": wind_kt})
        if wind_kt > storms[sid]["peak_kt"]:
            storms[sid]["peak_kt"] = wind_kt

    # Filter: keep only storms whose track passes within radius_km of city center
    result = []
    for sid, s in storms.items():
        if len(s["points"]) < 2:
            continue
        min_dist = min(haversine_km(p["lat"], p["lng"], clat, clng) for p in s["points"])
        if min_dist <= radius:
            s["min_dist_km"] = round(min_dist, 1)
            result.append(s)

    result.sort(key=lambda s: s["year"])
    print(f"  {city_name}: {len(result)} storms within {radius}km", flush=True)
    return result


def storms_to_geojson(storms):
    """Convert storm list to GeoJSON FeatureCollection."""
    features = []
    for s in storms:
        # Deduplicate consecutive identical points
        pts = s["points"]
        coords = []
        prev = None
        for p in pts:
            if prev is None or p["lat"] != prev["lat"] or p["lng"] != prev["lng"]:
                coords.append([p["lng"], p["lat"]])
                prev = p

        if len(coords) < 2:
            continue

        peak_kmh = round(s["peak_kt"] * 1.852, 0)
        features.append({
            "type": "Feature",
            "properties": {
                "sid": s["sid"],
                "name": s["name"],
                "year": s["year"],
                "peak_kt": s["peak_kt"],
                "peak_kmh": peak_kmh,
                "min_dist_km": s.get("min_dist_km", 0),
            },
            "geometry": {"type": "LineString", "coordinates": coords}
        })

    return {"type": "FeatureCollection", "features": features}


def compute_risk_grid(storms, bbox, resolution_deg=0.04):
    """
    Fast O(track_points) accumulation approach:
    For each track point, spread its influence to nearby grid cells.
    Returns list of {lat, lng, score}.
    """
    minLat, minLng, maxLat, maxLng = bbox

    # Build accumulator grid
    lat_steps = int((maxLat - minLat) / resolution_deg) + 1
    lng_steps = int((maxLng - minLng) / resolution_deg) + 1
    acc = [[0.0] * lng_steps for _ in range(lat_steps)]

    influence_cells = int(1.5 / resolution_deg) + 1  # ~150km influence radius in cells
    scale_deg = 0.8  # Gaussian scale in degrees (~89km)

    for s in storms:
        peak = s["peak_kt"] or 0
        for p in s["points"]:
            tlat, tlng = p["lat"], p["lng"]
            twnd = p.get("wind_kt") or peak
            if twnd < 34:  # ignore sub-tropical-storm strength
                continue
            intensity = min(twnd / 150.0, 1.0)

            # Grid cell for this track point
            ci = int((tlat - minLat) / resolution_deg)
            cj = int((tlng - minLng) / resolution_deg)

            # Spread to surrounding cells
            for di in range(-influence_cells, influence_cells + 1):
                ii = ci + di
                if ii < 0 or ii >= lat_steps:
                    continue
                for dj in range(-influence_cells, influence_cells + 1):
                    jj = cj + dj
                    if jj < 0 or jj >= lng_steps:
                        continue
                    dist_deg = math.sqrt(di**2 + dj**2) * resolution_deg
                    decay = math.exp(-(dist_deg ** 2) / (2 * scale_deg ** 2))
                    acc[ii][jj] += intensity * decay

    # Flatten to list and normalize
    grid = []
    max_score = 0.0
    for i in range(lat_steps):
        for j in range(lng_steps):
            lat = round(minLat + i * resolution_deg, 5)
            lng = round(minLng + j * resolution_deg, 5)
            score = acc[i][j]
            grid.append({"lat": lat, "lng": lng, "score": score})
            if score > max_score:
                max_score = score

    if max_score > 0:
        for g in grid:
            g["score"] = round(g["score"] / max_score, 4)

    return grid


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    # Download CSVs (one per basin)
    basin_data = {}
    basins_needed = set(c["basin"] for c in CITIES.values())
    for basin in basins_needed:
        print(f"\n[{basin}] Downloading IBTrACS...", flush=True)
        basin_data[basin] = download_csv(BASIN_URLS[basin])

    # Process each city
    for city_name, cfg in CITIES.items():
        print(f"\n[{city_name.upper()}] Processing...", flush=True)
        csv_text = basin_data[cfg["basin"]]
        storms = parse_ibtracs(csv_text, city_name, cfg)

        # 1a. Full storm tracks GeoJSON (all storms, for reference)
        geojson = storms_to_geojson(storms)
        out_path = os.path.join(STORMS_DIR, f"{city_name}-all.geojson")
        with open(out_path, "w") as f:
            json.dump(geojson, f, separators=(",", ":"))
        size_kb = os.path.getsize(out_path) // 1024
        print(f"  Wrote {out_path} ({size_kb} KB, {len(geojson['features'])} tracks)", flush=True)

        # 1b. Browser display GeoJSON: top 200 by intensity + any within 150km
        top_storms = sorted(storms, key=lambda s: s["peak_kt"], reverse=True)[:200]
        close_storms = [s for s in storms if s.get("min_dist_km", 999) < 150]
        display_set = {s["sid"]: s for s in top_storms + close_storms}
        display_geojson = storms_to_geojson(list(display_set.values()))
        tracks_path = os.path.join(STORMS_DIR, f"{city_name}-tracks.geojson")
        with open(tracks_path, "w") as f:
            json.dump(display_geojson, f, separators=(",", ":"))
        size_kb = os.path.getsize(tracks_path) // 1024
        print(f"  Wrote {tracks_path} ({size_kb} KB, {len(display_geojson['features'])} tracks)", flush=True)

        # 2. Risk grid from track density
        minLat, minLng, maxLat, maxLng = cfg["bbox"]
        # Narrow the risk grid to a tighter area around the city for performance
        clat, clng = cfg["lat"], cfg["lng"]
        pad = 1.5  # degrees
        tight_bbox = (clat - pad, clng - pad, clat + pad, clng + pad)
        grid = compute_risk_grid(storms, tight_bbox, resolution_deg=0.05)
        risk_path = os.path.join(RISK_DIR, f"{city_name}.json")
        with open(risk_path, "w") as f:
            json.dump({"city": city_name, "points": grid}, f, separators=(",", ":"))
        size_kb = os.path.getsize(risk_path) // 1024
        print(f"  Wrote {risk_path} ({size_kb} KB, {len(grid)} grid points)", flush=True)

    print("\nDone.", flush=True)


if __name__ == "__main__":
    main()
