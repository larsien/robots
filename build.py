"""Build a dependency-free, offline HTML lesson from local source files."""
from pathlib import Path
import re
root = Path(__file__).resolve().parent
source = root / 'src'
page = (source / 'ar3.html').read_text()
def inline(match):
    path = source / match.group(1)
    assert path.parent == source and path.is_file(), path
    code = path.read_text()
    assert '</script' not in code.lower(), path
    return '<script>\n' + code + '\n</script>'
page = re.sub(r'<script src="([\w.-]+)"></script>', inline, page)
license_text = (source / 'COLORFIGURES-LICENSE').read_text()
page = page.replace('<html lang="en">', '<!--\n' + license_text + '\nAR3 kinematic data: Copyright (c) 2021 Dexter Ong, MIT license (same terms above).\n-->\n<html lang="en">')
out = root / 'artifacts' / 'ar3-learning-lab.html'
out.parent.mkdir(exist_ok=True)
out.write_text(page)
out.with_name('index.html').write_text(page)
print(out)
