"""Compatibility entry point: the Writer SVG is the only icon source."""
from pathlib import Path
import subprocess

root = Path(__file__).resolve().parents[1]
subprocess.run(['node', str(root / 'scripts' / 'brand-assets.mjs'), '--writer'], cwd=root, check=True)
