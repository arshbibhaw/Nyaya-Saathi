"""Reset database — drop all tables and recreate them."""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.session import engine, Base
import app.models  # noqa: F401 — register all models

def reset_db():
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    print("Database reset complete!")

if __name__ == "__main__":
    reset_db()
