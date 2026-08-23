from app.db.session import SessionLocal
from app.services.case_service import classify_and_create_case
import uuid
db = SessionLocal()
try:
    case = classify_and_create_case(db, "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "I bought a defective laptop and they refuse to refund.")
    print("Success:", case.id)
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()
