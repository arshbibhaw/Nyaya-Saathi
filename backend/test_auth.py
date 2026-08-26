import traceback
from app.db.session import SessionLocal
from app.api.v1.auth import register
from app.schemas.user import UserCreate

def run():
    db = SessionLocal()
    try:
        user_in = UserCreate(email='test3@example.com', password='password', full_name='Test')
        res = register(user_in, db)
        print("OK", res)
    except Exception as e:
        traceback.print_exc()
    finally:
        db.close()

if __name__ == '__main__':
    run()
