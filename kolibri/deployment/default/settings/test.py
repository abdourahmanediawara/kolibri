import json
import os
import tempfile

# If KOLIBRI_HOME isn't defined in the test env, it's okay to just set a
# temp directory for testing.
if "KOLIBRI_HOME" not in os.environ:
    os.environ["KOLIBRI_HOME"] = tempfile.mkdtemp()

# AE Apprendre: enable external plugins in the isolated pytest KOLIBRI_HOME
# before base settings load ACTIVE_PLUGINS into INSTALLED_APPS.
_AE_PLUGINS = (
    "action_education_theme",
    "action_education_portal",
    "action_education_training",
)
_home = os.environ["KOLIBRI_HOME"]
os.makedirs(_home, exist_ok=True)
_conf_path = os.path.join(_home, "plugins.json")
try:
    from kolibri.utils.build_config.default_plugins import DEFAULT_PLUGINS

    _installed = list(DEFAULT_PLUGINS)
    for _plugin in _AE_PLUGINS:
        try:
            __import__(_plugin)
        except ImportError:
            continue
        if _plugin not in _installed:
            _installed.append(_plugin)
    _disabled = []
    if (
        "action_education_theme" in _installed
        and "kolibri.plugins.default_theme" in _installed
    ):
        _disabled.append("kolibri.plugins.default_theme")
    with open(_conf_path, "w", encoding="utf-8") as _handle:
        json.dump(
            {
                "INSTALLED_PLUGINS": _installed,
                "DISABLED_PLUGINS": _disabled,
                "UPDATED_PLUGINS": [],
                "PLUGIN_VERSIONS": {},
            },
            _handle,
            indent=2,
        )
except Exception:
    pass


from .base import *  # noqa isort:skip @UnusedWildImport

try:
    process_cache = CACHES["process_cache"]  # noqa F405
except KeyError:
    process_cache = None

# Create a dummy cache for each cache
CACHES = {
    key: {"BACKEND": "django.core.cache.backends.dummy.DummyCache"}
    for key in CACHES  # noqa F405
}

if process_cache:
    CACHES["process_cache"] = process_cache

TESTING = True
