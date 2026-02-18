# Contributing to IntentBridge

Thank you for your interest in contributing to IntentBridge! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/INTENTBRIDGE.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Commit with a descriptive message: `git commit -m "feat: add your feature"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Open a Pull Request

## Development Setup

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation changes
- `style:` — Code style changes (formatting, etc.)
- `refactor:` — Code refactoring
- `test:` — Adding or modifying tests
- `chore:` — Maintenance tasks
- `build:` — Build system or dependency changes

## Code Style

- **Python**: Follow PEP 8. Use type hints where possible.
- **JavaScript/React**: Follow ESLint configuration provided.
- **Commits**: Keep commits atomic and well-described.

## Reporting Issues

Use the GitHub issue templates for bug reports and feature requests.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
