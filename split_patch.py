import re
import os
import subprocess

# Run git diff directly in python to avoid encoding issues
result = subprocess.run(['git', 'diff'], capture_output=True, text=True, encoding='utf-8')
lines = result.stdout.splitlines(keepends=True)

hunks = []
current_hunk = None
current_header = []

for line in lines:
    if line.startswith('diff --git'):
        current_header = [line]
    elif line.startswith('index ') or line.startswith('--- ') or line.startswith('+++ '):
        current_header.append(line)
    elif line.startswith('@@'):
        if current_hunk:
            hunks.append(current_hunk)
        current_hunk = current_header.copy()
        current_hunk.append(line)
    elif current_hunk is not None:
        current_hunk.append(line)

if current_hunk:
    hunks.append(current_hunk)

print(f"Total hunks found: {len(hunks)}")

# We need exactly 20 commits.
for i, hunk in enumerate(hunks):
    with open(f'hunk_{i+1}.patch', 'w', encoding='utf-8') as f:
        f.writelines(hunk)
