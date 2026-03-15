import os
import subprocess

def run(c):
    subprocess.run(c, shell=True, check=True)

# 1. Tailwind
run('git checkout HEAD frontend/tailwind.config.js')
with open('frontend/tailwind.config.js', 'r') as f: t = f.read()

t = t.replace('extend: {},', "extend: {\n      colors: {\n        aurora: {\n          50: '#f0fdfa',\n          100: '#ccfbf1',\n          200: '#99f6e4',\n          300: '#5eead4',\n          400: '#2dd4bf',\n          500: '#14b8a6',\n          600: '#0d9488',\n          700: '#0f766e',\n          800: '#115e59',\n          900: '#134e4a',\n        }\n      }\n    },")
with open('frontend/tailwind.config.js', 'w') as f: f.write(t)
run('git add frontend/tailwind.config.js && git commit -m "feat(ui): add aurora theme colors"')

t = t.replace("      colors: {", "      colors: {\n        midnight: {\n          900: '#0B0D17',\n          800: '#15192B',\n          700: '#20263D',\n        },")
with open('frontend/tailwind.config.js', 'w') as f: f.write(t)
run('git add frontend/tailwind.config.js && git commit -m "feat(ui): add midnight theme colors"')

t = t.replace("extend: {", "extend: {\n      fontFamily: {\n        sans: ['Inter', 'system-ui', 'sans-serif'],\n      },")
with open('frontend/tailwind.config.js', 'w') as f: f.write(t)
run('git add frontend/tailwind.config.js && git commit -m "chore(ui): update font family configuration"')

t = t.replace("extend: {", "extend: {\n      animation: {\n        'blob': 'blob 7s infinite',\n        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',\n        'float': 'float 6s ease-in-out infinite',\n      },")
with open('frontend/tailwind.config.js', 'w') as f: f.write(t)
run('git add frontend/tailwind.config.js && git commit -m "feat(ui): add keyframe animations config"')

t = t.replace("extend: {", "extend: {\n      keyframes: {\n        blob: {\n          '0%': {\n            transform: 'translate(0px, 0px) scale(1)',\n          },\n          '33%': {\n            transform: 'translate(30px, -50px) scale(1.1)',\n          },\n          '66%': {\n            transform: 'translate(-20px, 20px) scale(0.9)',\n          },\n          '100%': {\n            transform: 'translate(0px, 0px) scale(1)',\n          },\n        },\n        float: {\n          '0%, 100%': { transform: 'translateY(0)' },\n          '50%': { transform: 'translateY(-10px)' },\n        }\n      },")
with open('frontend/tailwind.config.js', 'w') as f: f.write(t)
run('git add frontend/tailwind.config.js && git commit -m "feat(ui): define blob and float keyframes"')

# 2. CSS
run('git checkout HEAD frontend/src/index.css')
with open('frontend/src/index.css', 'r') as f: c = f.read()

c = c.replace("background: linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #eff6ff 100%);\n  color: #1e293b;", "background-color: #0B0D17;\n  color: #f1f5f9;\n  overflow-x: hidden;")
with open('frontend/src/index.css', 'w') as f: f.write(c)
run('git add frontend/src/index.css && git commit -m "style(css): apply dark background to body"')

c = c.replace("background: #e2e8f0;", "background: rgba(255, 255, 255, 0.1);").replace("background: #cbd5e1;", "background: rgba(255, 255, 255, 0.2);")
with open('frontend/src/index.css', 'w') as f: f.write(c)
run('git add frontend/src/index.css && git commit -m "style(css): update scrollbar for dark theme"')

c = c.replace("/* ─── Animations ─── */", "/* ─── Utilities ─── */\n.glass-panel {\n  background: rgba(21, 25, 43, 0.6);\n  backdrop-filter: blur(16px);\n  -webkit-backdrop-filter: blur(16px);\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);\n}\n\n/* ─── Animations ─── */")
with open('frontend/src/index.css', 'w') as f: f.write(c)
run('git add frontend/src/index.css && git commit -m "style(css): add glass panel utility"')

c = c.replace("/* ─── Animations ─── */", ".glass-header {\n  background: rgba(11, 13, 23, 0.75);\n  backdrop-filter: blur(20px);\n  -webkit-backdrop-filter: blur(20px);\n  border-bottom: 1px solid rgba(255, 255, 255, 0.05);\n}\n\n/* ─── Animations ─── */")
with open('frontend/src/index.css', 'w') as f: f.write(c)
run('git add frontend/src/index.css && git commit -m "style(css): add glass header utility"')

c = c.replace("outline: 2px solid #3b82f6;", "outline: 2px solid #14b8a6; /* aurora-500 */")
with open('frontend/src/index.css', 'w') as f: f.write(c)
run('git add frontend/src/index.css && git commit -m "style(css): update outline focus color"')

c = c.replace("background: #bfdbfe;\n  color: #1e3a5f;", "background: rgba(20, 184, 166, 0.3); /* aurora-500 with opacity */\n  color: #fff;")
c = c.replace("color: #0f172a;\n", "")
with open('frontend/src/index.css', 'w') as f: f.write(c)
run('git add frontend/src/index.css && git commit -m "style(css): update text selection and typography colors"')

print("Completed 11 commits for tailwind and css.")
