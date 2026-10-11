"""Copy the generated knowledge-base page to the GitHub Pages directory."""
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parent
candidates = [path for path in ROOT.glob("*.html") if path.name != "knowledge_template.html"]
if len(candidates) != 1:
    raise RuntimeError(f"Expected one generated HTML file, found: {candidates}")
shutil.copy2(candidates[0], ROOT.parent / "index.html")

