"""Tahlil API — o'quvchi bilimini mavzu bo'yicha risk management bilan tahlil qilish."""

import logging
from collections import defaultdict
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy import select, desc, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.models.user import User
from backend.models.submission import Submission
from backend.services.gemini_service import GeminiService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/analysis", tags=["analysis"])

gemini_service = GeminiService()


def _risk_level(score: float) -> str:
    if score >= 80:
        return "green"
    elif score >= 50:
        return "yellow"
    return "red"


def _risk_label(level: str) -> str:
    return {
        "green": "Yaxshi o'zlashtiryapti",
        "yellow": "O'rtacha, mashq kerak",
        "red": "Qo'shimcha tayyorlik kerak",
    }.get(level, "")


@router.get("/student/{telegram_id}")
async def get_student_analysis(telegram_id: int, db: AsyncSession = Depends(get_db)):
    """O'quvchining to'liq bilim tahlili — mavzu bo'yicha risk management."""

    # O'quvchini topish
    result = await db.execute(
        select(User).where(User.telegram_id == telegram_id, User.role == "student")
    )
    user = result.scalars().first()
    if not user:
        return JSONResponse(status_code=404, content={"detail": "O'quvchi topilmadi"})

    # Barcha submissionlarni olish
    subs_result = await db.execute(
        select(Submission)
        .where(and_(Submission.student_id == user.id, Submission.status == "completed"))
        .order_by(desc(Submission.created_at))
        .limit(100)
    )
    submissions = subs_result.scalars().all()

    if not submissions:
        return {
            "overall_score": 0,
            "risk_level": "red",
            "risk_label": "Hali tekshiruv yo'q",
            "total_submissions": 0,
            "subjects": {},
            "weak_topics": [],
            "strong_topics": [],
            "recommendation": "Daftaringizni suratga olib yuboring — AI tekshirib beradi!",
        }

    # Fan bo'yicha guruhlash
    subjects_data = defaultdict(lambda: {
        "scores": [], "topics": defaultdict(lambda: {"scores": [], "attempts": 0}),
        "weak_topics_raw": []
    })

    for sub in submissions:
        subj = sub.subject or "matematika"
        if sub.score is not None:
            subjects_data[subj]["scores"].append(sub.score)

        ai = sub.ai_result
        if not ai:
            continue

        # Zaif mavzularni yig'ish
        for topic in ai.get("weak_topics", []):
            subjects_data[subj]["weak_topics_raw"].append(topic)

        # Masalalar dan mavzu tahlili
        for problem in ai.get("problems", []):
            topic = problem.get("problem_text", "Umumiy")[:50]
            score = problem.get("score", 0)
            # Masala textidan mavzu aniqlash (qisqartirilgan)
            subjects_data[subj]["topics"][topic]["scores"].append(score * 100)
            subjects_data[subj]["topics"][topic]["attempts"] += 1

    # Natijalarni hisoblash
    all_scores = []
    subjects_result = {}

    for subj, data in subjects_data.items():
        scores = data["scores"]
        avg = round(sum(scores) / len(scores), 1) if scores else 0
        all_scores.extend(scores)

        # Mavzu bo'yicha
        topics = {}
        for topic, tdata in data["topics"].items():
            t_scores = tdata["scores"]
            t_avg = round(sum(t_scores) / len(t_scores), 1) if t_scores else 0
            topics[topic] = {
                "score": t_avg,
                "risk": _risk_level(t_avg),
                "risk_label": _risk_label(_risk_level(t_avg)),
                "attempts": tdata["attempts"],
            }

        # Zaif/kuchli mavzular (weak_topics dan)
        weak_counts = defaultdict(int)
        for t in data["weak_topics_raw"]:
            weak_counts[t] += 1
        weak_sorted = sorted(weak_counts.items(), key=lambda x: -x[1])
        weak_topics = [t for t, _ in weak_sorted[:5]]

        # Kuchli mavzular — eng yuqori balllar
        strong_topics = [
            t for t, td in sorted(topics.items(), key=lambda x: -x[1]["score"])
            if td["score"] >= 80
        ][:5]

        risk = _risk_level(avg)
        subjects_result[subj] = {
            "avg_score": avg,
            "risk": risk,
            "risk_label": _risk_label(risk),
            "total_submissions": len(scores),
            "topics": topics,
            "weak_topics": weak_topics,
            "strong_topics": strong_topics,
        }

    overall = round(sum(all_scores) / len(all_scores), 1) if all_scores else 0
    overall_risk = _risk_level(overall)

    # Tavsiya
    if overall_risk == "red":
        rec = "Ko'proq mashq qilish kerak. Zaif mavzularga e'tibor bering va har kuni kamida 1 ta vazifa tekshiring."
    elif overall_risk == "yellow":
        rec = "Yaxshi yo'ldasiz! Zaif mavzularga biroz ko'proq vaqt ajrating va streakni davom ettiring."
    else:
        rec = "Ajoyib natija! Murakkabroq masalalar bilan bilimingizni mustahkamlang."

    return {
        "overall_score": overall,
        "risk_level": overall_risk,
        "risk_label": _risk_label(overall_risk),
        "total_submissions": len(submissions),
        "subjects": subjects_result,
        "weak_topics": list({t for s in subjects_result.values() for t in s["weak_topics"]})[:5],
        "strong_topics": list({t for s in subjects_result.values() for t in s["strong_topics"]})[:5],
        "recommendation": rec,
    }


@router.get("/classroom-risks")
async def get_classroom_risks(db: AsyncSession = Depends(get_db)):
    """Barcha o'quvchilarni 3 guruhga bo'lish — o'qituvchi uchun risk management."""

    # Barcha o'quvchilarni olish
    result = await db.execute(
        select(
            User.id, User.telegram_id, User.full_name, User.grade, User.subject,
            func.avg(Submission.score).label("avg_score"),
            func.count(Submission.id).label("sub_count"),
        )
        .outerjoin(Submission, and_(
            Submission.student_id == User.id,
            Submission.status == "completed",
        ))
        .where(User.role == "student")
        .group_by(User.id)
    )
    rows = result.all()

    green, yellow, red = [], [], []

    for row in rows:
        avg = round(float(row.avg_score or 0), 1)
        sub_count = row.sub_count or 0

        # Hali tekshiruv yubormaganlarni o'tkazib yuborish
        if sub_count == 0:
            continue

        # Zaif mavzular
        weak_result = await db.execute(
            select(Submission.ai_result)
            .where(and_(Submission.student_id == row.id, Submission.status == "completed"))
            .order_by(desc(Submission.created_at))
            .limit(10)
        )
        weak_topics = set()
        for (ai_result,) in weak_result.all():
            if ai_result:
                for t in ai_result.get("weak_topics", []):
                    weak_topics.add(t)

        student_info = {
            "telegram_id": row.telegram_id,
            "name": row.full_name,
            "grade": row.grade,
            "subject": row.subject,
            "avg_score": avg,
            "submissions": sub_count,
            "weak_topics": list(weak_topics)[:3],
        }

        if avg >= 80:
            green.append(student_info)
        elif avg >= 50:
            yellow.append(student_info)
        else:
            red.append(student_info)

    # Saralash
    green.sort(key=lambda x: -x["avg_score"])
    yellow.sort(key=lambda x: -x["avg_score"])
    red.sort(key=lambda x: x["avg_score"])

    return {
        "green": green,
        "yellow": yellow,
        "red": red,
        "summary": {
            "green_count": len(green),
            "yellow_count": len(yellow),
            "red_count": len(red),
            "total": len(green) + len(yellow) + len(red),
            "green_advice": "Murakkabroq topshiriqlar bering — ular tayyor",
            "yellow_advice": "Mashqni davom etsin, zaif mavzularga e'tibor bering",
            "red_advice": "Individual yondashuv kerak, ota-onani xabardor qiling",
        },
    }


@router.get("/career-prediction/{telegram_id}")
async def get_career_prediction(telegram_id: int, db: AsyncSession = Depends(get_db)):
    """O'quvchining fan natijalariga qarab kasbiy yo'nalish bashorati."""

    # O'quvchini topish
    result = await db.execute(
        select(User).where(User.telegram_id == telegram_id, User.role == "student")
    )
    user = result.scalars().first()
    if not user:
        return JSONResponse(status_code=404, content={"detail": "O'quvchi topilmadi"})

    # Barcha submissionlarni olish
    subs_result = await db.execute(
        select(Submission)
        .where(and_(Submission.student_id == user.id, Submission.status == "completed"))
        .order_by(desc(Submission.created_at))
        .limit(100)
    )
    submissions = subs_result.scalars().all()

    # Minimum 5 ta submission kerak
    if len(submissions) < 5:
        return {
            "ready": False,
            "message": f"Kasb yo'nalishini aniqlash uchun kamida 5 ta tekshiruv kerak. Hozircha {len(submissions)} ta bor.",
            "submissions_needed": 5 - len(submissions),
            "career_directions": [],
        }

    # Fan bo'yicha o'rtacha ballarni hisoblash
    subject_scores = defaultdict(list)
    all_weak = []
    all_strong = []

    for sub in submissions:
        subj = sub.subject or "matematika"
        if sub.score is not None:
            subject_scores[subj].append(sub.score)
        ai = sub.ai_result
        if ai:
            all_weak.extend(ai.get("weak_topics", []))
            # Kuchli mavzularni aniqlash
            for p in ai.get("problems", []):
                if p.get("score", 0) >= 1:
                    all_strong.append(p.get("problem_text", "")[:50])

    # Kamida 2 ta fan kerak yaxshi bashorat uchun
    subjects_avg = {}
    for subj, scores in subject_scores.items():
        subjects_avg[subj] = round(sum(scores) / len(scores), 1)

    if len(subjects_avg) < 2:
        return {
            "ready": False,
            "message": "Kasb yo'nalishini aniqlash uchun kamida 2 ta fandan natija kerak.",
            "current_subjects": list(subjects_avg.keys()),
            "career_directions": [],
        }

    # Zaif va kuchli mavzularni saralash
    weak_counts = defaultdict(int)
    for t in all_weak:
        weak_counts[t] += 1
    top_weak = [t for t, _ in sorted(weak_counts.items(), key=lambda x: -x[1])[:5]]

    strong_counts = defaultdict(int)
    for t in all_strong:
        strong_counts[t] += 1
    top_strong = [t for t, _ in sorted(strong_counts.items(), key=lambda x: -x[1])[:5]]

    # Gemini ga yuborish
    student_data = {
        "grade": user.grade or 7,
        "total_submissions": len(submissions),
        "subjects": subjects_avg,
        "weak_topics": top_weak,
        "strong_topics": top_strong,
    }

    prediction = await gemini_service.predict_career(student_data)

    if prediction.get("error"):
        return JSONResponse(
            status_code=500,
            content={"detail": prediction.get("error_message", "AI xatolik")},
        )

    return {
        "ready": True,
        "student_name": user.full_name,
        "grade": user.grade,
        "subjects_analyzed": subjects_avg,
        "total_submissions": len(submissions),
        **prediction,
    }
