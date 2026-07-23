"""Source-level offline checks for the AE portal frontend."""
from pathlib import Path

REMOTE_MARKERS = (
    "https://cdn.",
    "http://cdn.",
    "fonts.googleapis.com",
    "fonts.gstatic.com",
    "ajax.googleapis.com",
)


def test_portal_frontend_has_no_cdn_urls():
    root = Path(__file__).resolve().parents[1].joinpath("frontend")
    offenders = []
    for path in root.rglob("*"):
        if path.suffix not in {".js", ".vue", ".scss", ".css", ".html"}:
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        for marker in REMOTE_MARKERS:
            if marker in text:
                offenders.append("{} contains {}".format(path, marker))
    assert offenders == []


def test_portal_routes_include_offline_report_pages():
    routes = Path(__file__).resolve().parents[1].joinpath("frontend/routes.js").read_text()
    assert "PortalCertificates" in routes
    assert "PortalReports" in routes
