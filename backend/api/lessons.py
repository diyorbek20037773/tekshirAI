"""Interaktiv 3D darslar API: fanlar, mavzular, qismlar."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.models.lesson import LessonSubject, LessonTopic, LessonPart

router = APIRouter(prefix="/api/lessons", tags=["lessons"])


@router.get("/subjects")
async def list_subjects(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(LessonSubject))
    subjects = res.scalars().all()
    out = []
    for s in subjects:
        cnt = await db.execute(select(func.count(LessonTopic.id)).where(LessonTopic.subject_id == s.id))
        out.append({
            "slug": s.slug,
            "name_uz": s.name_uz,
            "icon": s.icon,
            "is_active": s.is_active,
            "topic_count": cnt.scalar() or 0,
        })
    out.sort(key=lambda x: (not x["is_active"], x["name_uz"]))
    return {"subjects": out}


@router.get("/subjects/{slug}/topics")
async def list_topics(slug: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(LessonSubject).where(LessonSubject.slug == slug))
    subj = res.scalar_one_or_none()
    if not subj:
        raise HTTPException(404, "Subject not found")
    res = await db.execute(
        select(LessonTopic).where(LessonTopic.subject_id == subj.id).order_by(LessonTopic.sort_order, LessonTopic.title_uz)
    )
    topics = res.scalars().all()
    return {
        "subject": {"slug": subj.slug, "name_uz": subj.name_uz, "icon": subj.icon},
        "topics": [
            {
                "id": str(t.id),
                "slug": t.slug,
                "title_uz": t.title_uz,
                "description_uz": t.description_uz,
                "icon": t.icon,
                "parts_count": len(t.parts),
            }
            for t in topics
        ],
    }


@router.get("/topics/{topic_id}")
async def get_topic(topic_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(LessonTopic).where(LessonTopic.id == topic_id))
    t = res.scalar_one_or_none()
    if not t:
        raise HTTPException(404, "Topic not found")
    rot = [float(x) for x in (t.initial_rotation or "0,0,0").split(",")]
    return {
        "id": str(t.id),
        "slug": t.slug,
        "title_uz": t.title_uz,
        "description_uz": t.description_uz,
        "icon": t.icon,
        "model_file": t.model_file,
        "initial_rotation": rot,
        "parts": [
            {
                "mesh_index": p.mesh_index,
                "label_uz": p.label_uz,
                "info_uz": p.info_uz,
                "color_hex": p.color_hex,
            }
            for p in t.parts
        ],
    }
