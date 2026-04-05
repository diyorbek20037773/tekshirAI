"""Geolokatsiya API — viloyat/tuman aniqlash."""

import json
import logging
from pathlib import Path
from fastapi import APIRouter, Query
from shapely.geometry import shape, Point

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/geo", tags=["geo"])

# GeoJSON bir marta yuklanadi
_geojson_cache = None
_shapes_cache = None
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
    global _geojson_cache, _shapes_cache
    if _geojson_cache is not None:
        return _geojson_cache
    try:
        with open(GEOJSON_PATH, "r", encoding="utf-8") as f:
            _geojson_cache = json.load(f)
        # Shapely obyektlarni oldindan yaratish
        _shapes_cache = []
        for feature in _geojson_cache["features"]:
            try:
                geom = shape(feature["geometry"])
                _shapes_cache.append((geom, feature["properties"]))
            except Exception:
                pass
        logger.info(f"GeoJSON yuklandi: {len(_shapes_cache)} tuman (shapely)")
    except Exception as e:
        logger.error(f"GeoJSON yuklashda xato: {e}")
        _geojson_cache = {"features": []}
        _shapes_cache = []
    return _geojson_cache


def _detect_location(lat: float, lng: float) -> dict | None:
    """Lat/lng dan viloyat va tumanni aniqlash (shapely bilan)."""
    _load_geojson()
    if not _shapes_cache:
        return None

    point = Point(lng, lat)  # shapely: (x=lng, y=lat)

    for geom, props in _shapes_cache:
        if geom.contains(point):
            viloyat_nom = props.get("viloyat", "")
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

    # Fallback: eng yaqin tumanni topish (5 km ichida)
    min_dist = float("inf")
    closest = None
    for geom, props in _shapes_cache:
        dist = geom.distance(point)
        if dist < min_dist:
            min_dist = dist
            closest = props

    # ~0.05 daraja ≈ 5 km
    if closest and min_dist < 0.05:
        viloyat_nom = closest.get("viloyat", "")
        viloyat_kod = ""
        for v in VILOYATLAR:
            if v["nom"] == viloyat_nom:
                viloyat_kod = v["kod"]
                break
        return {
            "viloyat": viloyat_nom,
            "viloyat_kod": viloyat_kod,
            "tuman": closest.get("name", ""),
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
