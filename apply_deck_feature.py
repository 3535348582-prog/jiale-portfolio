# Reinject deck and POV layers idempotently; never rewrite existing effects.
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent
P = ROOT / 'template.html'
s = P.read_text(encoding='utf-8')
names = ('DECK_FEATURE_STYLE', 'DECK_FEATURE_SCRIPT', 'POV_WARP_STYLE', 'POV_WARP_SCRIPT')
for name in names:
    s = re.sub(r'<!--__' + name + r'__-->.*?<!--/__' + name + r'__-->', '', s, flags=re.S)

def block(name, tag, filename, element_id=''):
    attribute = (' id="' + element_id + '"') if element_id else ''
    return '<!--__' + name + '__--><' + tag + attribute + '>' + (ROOT / filename).read_text(encoding='utf-8') + '</' + tag + '><!--/__' + name + '__-->'

styles = block('DECK_FEATURE_STYLE', 'style', '_deck_feature.css', 'drawDeckStyle') + block('POV_WARP_STYLE', 'style', '_pov_warp.css', 'povWarpStyle')
scripts = block('POV_WARP_SCRIPT', 'script', '_pov_warp.js') + block('DECK_FEATURE_SCRIPT', 'script', '_deck_feature.js')
assert '</head>' in s and '</body>' in s
s = s.replace('</head>', styles + '</head>', 1).replace('</body>', scripts + '</body>', 1)
P.write_text(s, encoding='utf-8')
print('deck + POV injected OK; existing effects preserved')
