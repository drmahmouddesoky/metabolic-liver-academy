#!/usr/bin/env python3
"""
Make a dated backup of the Academy in a folder of your choice (for example a
folder on your Desktop). Run it from the repository folder:

    python3 scripts/backup.py ~/Desktop/MLA-Backup

It writes two files into that folder:
  MLA-site-YYYY-MM-DD.zip     every file of the site as it is now (pages, data,
                              sources, images, scripts, documents)
  MLA-history-YYYY-MM-DD.bundle   the complete Git history (every version of
                              every file since the site began)

To restore the site from the bundle on any computer with Git:
    git clone MLA-history-YYYY-MM-DD.bundle metabolic-liver-academy

The zip can simply be unzipped. Keep at least the last three backups.
"""
import datetime
import os
import subprocess
import sys
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = {".git", "__pycache__", "node_modules"}


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    dest = os.path.abspath(os.path.expanduser(sys.argv[1]))
    os.makedirs(dest, exist_ok=True)
    today = datetime.date.today().isoformat()
    zpath = os.path.join(dest, "MLA-site-%s.zip" % today)
    n = 0
    with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
        for dirpath, dirnames, files in os.walk(ROOT):
            dirnames[:] = sorted(d for d in dirnames if d not in SKIP_DIRS)
            for f in sorted(files):
                if f.endswith(".pyc"):
                    continue
                full = os.path.join(dirpath, f)
                z.write(full, os.path.relpath(full, ROOT))
                n += 1
    print("Site: %s (%d files, %.1f MB)" % (zpath, n, os.path.getsize(zpath) / 1e6))
    bpath = os.path.join(dest, "MLA-history-%s.bundle" % today)
    try:
        subprocess.run(["git", "-C", ROOT, "bundle", "create", bpath, "--all"], check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print("History: %s (%.1f MB)" % (bpath, os.path.getsize(bpath) / 1e6))
    except Exception:
        print("Git history not saved (Git is not installed, or this folder is not a Git clone). The zip is complete on its own.")
    print("Done. Backup folder: " + dest)


if __name__ == "__main__":
    main()
