"""
Optional E2E against a provisioned AE KOLIBRI_HOME (not the pytest DB).

Skipped by default. Run only when:
  AE_E2E=1 and /tmp/ae-e2e/users.csv exists
  with the live server DB / same KOLIBRI_HOME used for manual pilot.
"""
from __future__ import unicode_literals

import csv
import os

import pytest
from django.test import Client


PASSWORD_FILE = "/tmp/ae-e2e/users.csv"

pytestmark = pytest.mark.skipif(
    os.environ.get("AE_E2E") != "1",
    reason="Set AE_E2E=1 to run against a provisioned AE instance (users.csv).",
)


def _passwords():
    if not os.path.exists(PASSWORD_FILE):
        pytest.skip("Test users CSV missing; run bulkimport first")
    out = {}
    with open(PASSWORD_FILE, newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            out[row["USERNAME"]] = row["PASSWORD"]
    return out


def _login(client, username):
    passwords = _passwords()
    assert username in passwords
    resp = client.post(
        "/api/auth/session/",
        data={
            "username": username,
            "password": passwords[username],
            "facility": os.environ.get("AE_FACILITY_ID"),
        },
        content_type="application/json",
    )
    assert resp.status_code in (200, 201), resp.content
    return resp


@pytest.mark.django_db
def test_anonymous_portal_redirects_to_auth():
    client = Client()
    resp = client.get("/fr-fr/portal/", follow=False)
    assert resp.status_code == 302
    assert "/portal/" not in resp.url.split("?")[0]


@pytest.mark.django_db
def test_learner_reaches_portal_html():
    client = Client()
    _login(client, "ae_learner")
    resp = client.get("/fr-fr/portal/")
    assert resp.status_code == 200
    content = resp.content.decode("utf-8", errors="ignore")
    assert "action_education_portal" in content
    assert "Webpack Error" not in content
    assert "Compilation still" not in content


@pytest.mark.django_db
def test_learner_forbidden_on_training_write():
    client = Client()
    _login(client, "ae_learner")
    resp = client.post(
        "/action_education_training/api/session/",
        data={},
        content_type="application/json",
    )
    assert resp.status_code in (403, 405, 400)


@pytest.mark.django_db
def test_coach_can_list_sessions():
    client = Client()
    _login(client, "ae_coach")
    resp = client.get("/action_education_training/api/session/")
    assert resp.status_code == 200


@pytest.mark.django_db
def test_admin_can_list_facility_users():
    client = Client()
    _login(client, "ae_admin")
    resp = client.get("/api/auth/facilityuser/")
    assert resp.status_code == 200
