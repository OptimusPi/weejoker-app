import re

path = r'x:\weejoker.app\components\SeedCard.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Ante 1 Sprite
content = content.replace(
    'className="drop-shadow-md"\n                                                            />',
    'className="drop-shadow-md"\n                                                                delayClass={`balatro-delay-${jIdx + 2}`}\n                                                            />',
    1
)

# Replace Ante 2 Sprite
content = content.replace(
    'className="drop-shadow-md"\n                                                            />',
    'className="drop-shadow-md"\n                                                                delayClass={`balatro-delay-${jIdx + 4}`}\n                                                            />',
    1
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
