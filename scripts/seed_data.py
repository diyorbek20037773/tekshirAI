"""Test ma'lumotlar yaratish skripti"""

import asyncio
import sys
import os
import uuid
from datetime import datetime, date

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import async_session
from backend.models import User, UserGameProfile, Classroom, ClassroomStudent


async def seed():
    async with async_session() as session:
        # O'qituvchi yaratish
        teacher = User(
            id=uuid.uuid4(),
            telegram_id=100001,
            username="ustoz_karim",
            full_name="Karimov Jasur",
            role="teacher",
            subject="Matematika",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            daily_reset_date=date.today(),
        )
        session.add(teacher)
        await session.flush()

        # Sinf yaratish
        classroom = Classroom(
            id=uuid.uuid4(),
            teacher_id=teacher.id,
            name="7-A sinf",
            subject="Matematika",
        )
        session.add(classroom)
        await session.flush()

        # O'quvchilar yaratish
        students_data = [
            ("Aziz Toshmatov", "aziz_t", 200001),
            ("Dilnoza Rahimova", "dilnoza_r", 200002),
            ("Bobur Aliyev", "bobur_a", 200003),
            ("Nodira Karimova", "nodira_k", 200004),
            ("Sardor Umarov", "sardor_u", 200005),
        ]

        for full_name, username, tg_id in students_data:
            student = User(
                id=uuid.uuid4(),
                telegram_id=tg_id,
                username=username,
                full_name=full_name,
                role="student",
                grade=7,
                daily_reset_date=date.today(),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            session.add(student)
            await session.flush()

            # Game profil
            game_profile = UserGameProfile(
                user_id=student.id,
                xp=0,
                level=1,
                streak_days=0,
            )
            session.add(game_profile)

            # Sinfga qo'shish
            cs = ClassroomStudent(
                classroom_id=classroom.id,
                student_id=student.id,
            )
            session.add(cs)

        # Ota-ona yaratish
        parent = User(
            id=uuid.uuid4(),
            telegram_id=300001,
            username="otaona_1",
            full_name="Toshmatov Anvar (Aziz otasi)",
            role="parent",
            daily_reset_date=date.today(),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        session.add(parent)

        await session.commit()
        print("Test ma'lumotlar yaratildi!")
        print(f"  O'qituvchi: {teacher.full_name}")
        print(f"  Sinf: {classroom.name} ({classroom.invite_code})")
        print(f"  O'quvchilar: {len(students_data)} ta")
        print(f"  Ota-ona: {parent.full_name}")


if __name__ == "__main__":
    asyncio.run(seed())
