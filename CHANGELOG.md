# Changelog

All notable changes to the IntentBridge project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-02-18

### Added
- **Intent Classifier** module — parses raw user text to detect core goals, constraints, and target platform.
- **Ambiguity Resolver** module — identifies missing critical information and generates clarifying questions.
- **Execution Planner** module — produces comprehensive technical roadmaps with product definition, architecture, and milestones.
- **Build Engine** module — generates boilerplate code and project scaffolding from execution plans.
- **Orchestrator** — modular pipeline manager that chains all AI modules in sequence.
- **Mock AI mode** — deterministic stub responses for offline development without an API key.
- **FastAPI backend** with CORS support and structured JSON endpoints.
- **React frontend** with chat interface and execution roadmap viewer.
- **Docker Compose** configuration for full-stack deployment (backend + frontend + PostgreSQL).
- **SQLAlchemy models** for sessions, messages, and intent results.
- **Jinja2 prompt templates** for each AI module.
- Project documentation: README, CONTRIBUTING, SECURITY, and LICENSE.
- GitHub issue and PR templates.
- EditorConfig and Makefile for development workflow.
