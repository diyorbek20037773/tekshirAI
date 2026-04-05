"""Geolokatsiya API — viloyat/tuman aniqlash, maktablar ro'yxati."""

import json
import logging
from pathlib import Path
from fastapi import APIRouter, Query

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/geo", tags=["geo"])

# GeoJSON bir marta yuklanadi
_geojson_cache = None
GEOJSON_PATH = Path(__file__).parent.parent / "data" / "uz-tumanlar.geojson"

VILOYATLAR = [
    {"kod": "toshkent_sh", "nom": "Toshkent shahar"},
    {"kod": "toshkent_v", "nom": "Toshkent viloyati"},
    {"kod": "samarqand", "nom": "Samarqand viloyati"},
    {"kod": "fargona", "nom": "Farg'ona viloyati"},
    {"kod": "andijon", "nom": "Andijon viloyati"},
    {"kod": "namangan", "nom": "Namangan viloyati"},
    {"kod": "buxoro", "nom": "Buxoro viloyati"},
    {"kod": "xorazm", "nom": "Xorazm viloyati"},
    {"kod": "qashqadaryo", "nom": "Qashqadaryo viloyati"},
    {"kod": "surxondaryo", "nom": "Surxondaryo viloyati"},
    {"kod": "jizzax", "nom": "Jizzax viloyati"},
    {"kod": "sirdaryo", "nom": "Sirdaryo viloyati"},
    {"kod": "navoiy", "nom": "Navoiy viloyati"},
    {"kod": "qoraqalpogiston", "nom": "Qoraqolpog'iston Respublikasi"},
]


def _load_geojson():
    global _geojson_cache
    if _geojson_cache is not None:
        return _geojson_cache
    try:
        with open(GEOJSON_PATH, "r", encoding="utf-8") as f:
            _geojson_cache = json.load(f)
        logger.info(f"GeoJSON yuklandi: {len(_geojson_cache['features'])} tuman")
    except Exception as e:
        logger.error(f"GeoJSON yuklashda xato: {e}")
        _geojson_cache = {"features": []}
    return _geojson_cache


def _point_in_polygon(lat: float, lng: float, ring: list) -> bool:
    """Ray casting algorithm. GeoJSON coordinates: [longitude, latitude]."""
    inside = False
    n = len(ring)
    j = n - 1
    for i in range(n):
        # GeoJSON: ring[i] = [longitude, latitude]
        ring_lat_i, ring_lng_i = ring[i][1], ring[i][0]
        ring_lat_j, ring_lng_j = ring[j][1], ring[j][0]
        if (ring_lat_i > lat) != (ring_lat_j > lat) and \
           lng < ((ring_lng_j - ring_lng_i) * (lat - ring_lat_i)) / (ring_lat_j - ring_lat_i) + ring_lng_i:
            inside = not inside
        j = i
    return inside


def _detect_location(lat: float, lng: float) -> dict | None:
    """Lat/lng dan viloyat va tumanni aniqlash."""
    geo = _load_geojson()
    for feature in geo["features"]:
        props = feature["properties"]
        geom = feature["geometry"]

        if geom["type"] == "Polygon":
            rings = [geom["coordinates"][0]]
        elif geom["type"] == "MultiPolygon":
            rings = [p[0] for p in geom["coordinates"]]
        else:
            continue

        for ring in rings:
            if _point_in_polygon(lat, lng, ring):
                viloyat_nom = props.get("viloyat", "")
                # Viloyat kodini topish
                viloyat_kod = ""
                for v in VILOYATLAR:
                    if v["nom"] == viloyat_nom:
                        viloyat_kod = v["kod"]
                        break
                return {
                    "viloyat": viloyat_nom,
                    "viloyat_kod": viloyat_kod,
                    "tuman": props.get("name", ""),
                }
    return None


@router.get("/detect")
async def detect_location(lat: float = Query(...), lng: float = Query(...)):
    """GPS koordinatalari orqali viloyat va tumanni aniqlash."""
    result = _detect_location(lat, lng)
    if result:
        return {"found": True, **result}
    return {"found": False, "message": "Joylashuv aniqlanmadi"}


@router.get("/viloyatlar")
async def get_viloyatlar():
    """14 ta viloyat ro'yxati."""
    return VILOYATLAR


@router.get("/tumanlar")
async def get_tumanlar(viloyat: str = Query(..., description="Viloyat nomi")):
    """Viloyat bo'yicha tumanlar ro'yxati."""
    geo = _load_geojson()
    tumanlar = []
    for feature in geo["features"]:
        props = feature["properties"]
        if props.get("viloyat", "") == viloyat:
            tumanlar.append(props.get("name", ""))
    tumanlar.sort()
    return tumanlar


@router.get("/maktablar")
async def get_maktablar(tuman: str = Query(..., description="Tuman nomi")):
    """Tuman bo'yicha maktablar ro'yxati (1-sonli...60-sonli)."""
    # Tuman nomiga qarab maktab soni generatsiya qilish
    count = 35 + (hash(tuman) % 30)
    maktablar = [f"{i + 1}-sonli umumta'lim maktabi" for i in range(count)]
    return maktablar
