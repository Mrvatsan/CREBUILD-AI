"""
Database models for IntentBridge.

Defines SQLAlchemy ORM models for sessions, messages, and intent results.
These models persist the conversation history and AI-generated execution
plans for future reference and analytics.
"""
from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import datetime

Base = declarative_base()

class Session(Base):
    __tablename__ = "sessions"
    id = Column(String, primary_key=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    messages = relationship("Message", back_populates="session")

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, ForeignKey("sessions.id"))
    role = Column(String) # 'user' or 'system'
    content = Column(Text)
    structured_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    session = relationship("Session", back_populates="messages")

class IntentResult(Base):
    __tablename__ = "intent_results"
    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, ForeignKey("sessions.id"))
    intent_data = Column(JSON)
    plan_data = Column(JSON, nullable=True)
    build_artifacts = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
