#!/usr/bin/env python3
"""
Back up the whole Academy into your MLA folder on the Desktop: the public site AND the
private courses (module text, access codes, presentations). Run it from the site folder:

    python3 scripts/backup.py ~/Desktop/MLA

Suggested layout of that folder (the script finds the private courses on its own when
they sit next to the site, as here):

    MLA/
      metabolic-liver-academy/   the site (this repository)
      mla-courses/               the private courses (text, codes, presentations)
      Backups/                   written by this script, one dated folder per run
      Sources/                   your papers, guidelines and slides (backed up too)

Each run writes MLA/Backups/YYYY-MM-DD/ with:
  MLA-site-YYYY-MM-DD.zip             every file of the site as it is now
  MLA-site-history-YYYY-MM-DD.bundle  the site's complete Git history
  MLA-courses-YYYY-MM-DD.zip          every private course file, codes included
  MLA-courses-history-YYYY-MM-DD.bundle  the private courses' complete Git history
  MLA-sources-YYYY-MM-DD.zip          the Sources folder, if there is one
  README.txt                          what is in the folder and how to restore it

If the private courses are somewhere else:  --private /path/to/mla-courses

To restore from a bundle on any computer with Git:
    git clone MLA-site-history-YYYY-MM-DD.bundle metabolic-liver-academy
    git clone MLA-courses-history-YYYY-MM-DD.bundle mla-courses
A zip can simply be unzipped.

SECRET: the courses zip and bundle hold the access codes and the course key. Keep the
Backups folder on your own computer or an encrypted drive; never email it or put it in
a shared or public folder. Keep at least the last three backups.
"""
import argparse
import datetime
import os
import subprocess
import sys
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = {".git", "__pycache__", "node_modules", "Backups"}


def zip_folder(src, zpath):
    n = 0
    with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
        for dirpath, dirnames, files in os.walk(src):
            dirnames[:] = sorted(d for d in dirnames if d not in SKIP_DIRS)
            for f in sorted(files):
                if f.endswith(".pyc") or f == ".DS_Store":
                    continue
                full = os.path.join(dirpath, f)
                z.write(full, os.path.relpath(full, src))
                n += 1
    return n


def bundle(repo, bpath):
    try:
        subprocess.run(["git", "-C", repo, "bundle", "create", bpath, "--all"], check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except Exception:
        return False


def backup_one(label, src, out, today):
    zpath = os.path.join(out, "MLA-%s-%s.zip" % (label, today))
    n = zip_folder(src, zpath)
    line = "%-8s %s (%d files, %.1f MB)" % (label, os.path.basename(zpath), n, os.path.getsize(zpath) / 1e6)
    if os.path.isdir(os.path.join(src, ".git")):
        bpath = os.path.join(out, "MLA-%s-history-%s.bundle" % (label, today))
        if bundle(src, bpath):
            line += "\n         %s (%.1f MB)" % (os.path.basename(bpath), os.path.getsize(bpath) / 1e6)
        else:
            line += "\n         history not saved (Git is not installed); the zip is complete on its own"
    print(line)
    return line


def find_private(given):
    for p in ([given] if given else []) + [os.path.join(os.path.dirname(ROOT), "mla-courses")]:
        if p and os.path.isdir(os.path.join(os.path.expanduser(p), "courses")):
            return os.path.abspath(os.path.expanduser(p))
    return None


def main():
    ap = argparse.ArgumentParser(description="Back up the Academy (site and private courses).",
                                 epilog="Example: python3 scripts/backup.py ~/Desktop/MLA")
    ap.add_argument("folder", help="your MLA folder, e.g. ~/Desktop/MLA (backups go into its Backups/ subfolder)")
    ap.add_argument("--private", help="path to the private mla-courses folder, if it is not next to the site")
    a = ap.parse_args()

    base = os.path.abspath(os.path.expanduser(a.folder))
    today = datetime.date.today().isoformat()
    out = os.path.join(base, "Backups", today)
    os.makedirs(out, exist_ok=True)
    lines = [backup_one("site", ROOT, out, today)]

    private = find_private(a.private)
    if private:
        lines.append(backup_one("courses", private, out, today))
    else:
        print("\nWARNING: the private courses (mla-courses) were NOT found, so they are NOT in this backup.\n"
              "Put the mla-courses folder next to this site folder, or add --private /path/to/mla-courses.")
        lines.append("courses  NOT BACKED UP (folder not found)")

    sources = os.path.join(base, "Sources")
    if os.path.isdir(sources):
        lines.append(backup_one("sources", sources, out, today))

    with open(os.path.join(out, "README.txt"), "w", encoding="utf-8") as f:
        f.write("Metabolic Liver Academy backup, %s\n\n%s\n\n" % (today, "\n".join(lines)))
        f.write("SECRET: the courses files contain the access codes and the course key.\n"
                "Keep them on your own computer or an encrypted drive.\n\n"
                "Restore: unzip a zip, or  git clone <bundle file> <folder name>\n")
    print("\nDone. Backup folder: " + out)


if __name__ == "__main__":
    sys.exit(main())
