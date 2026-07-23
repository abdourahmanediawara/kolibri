#!/usr/bin/env python3
"""Create a timestamped tar.gz backup of KOLIBRI_HOME."""
from __future__ import print_function

import argparse
import os
import sys
import tarfile
from datetime import datetime
from pathlib import Path


def main(argv=None):
    parser = argparse.ArgumentParser(description="Backup AE Apprendre KOLIBRI_HOME")
    parser.add_argument(
        "--kolibri-home",
        default=os.environ.get("KOLIBRI_HOME", ""),
        help="Path to KOLIBRI_HOME",
    )
    parser.add_argument(
        "--dest",
        required=True,
        help="Directory where the archive will be written",
    )
    args = parser.parse_args(argv)

    home = Path(args.kolibri_home).expanduser().resolve()
    if not home.is_dir():
        print("KOLIBRI_HOME not found: {}".format(home), file=sys.stderr)
        return 2

    dest_dir = Path(args.dest).expanduser().resolve()
    dest_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    archive = dest_dir / "ae-backup-{}.tar.gz".format(stamp)

    # Skip volatile WAL/SHM companions; sqlite main db is enough after stop.
    skip_suffixes = (".sqlite3-shm", ".sqlite3-wal")

    with tarfile.open(archive, "w:gz") as tar:
        for path in home.rglob("*"):
            if not path.is_file():
                continue
            if path.name.endswith(skip_suffixes):
                continue
            arcname = Path("KOLIBRI_HOME") / path.relative_to(home)
            tar.add(str(path), arcname=str(arcname))

    print("Wrote {}".format(archive))
    print("Size {:.1f} MB".format(archive.stat().st_size / 1e6))
    return 0


if __name__ == "__main__":
    sys.exit(main())
