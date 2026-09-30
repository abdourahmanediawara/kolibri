"""Helpers for TrainingResource uploads and links (kind detection and validation)."""

import mimetypes
import os
from urllib.parse import urlparse

from action_education_training.constants import ALLOWED_RESOURCE_EXTENSIONS
from action_education_training.constants import INLINE_RESOURCE_EXTENSIONS
from action_education_training.constants import RESOURCE_EXTENSION_KIND
from action_education_training.constants import RESOURCE_OTHER
from action_education_training.constants import TRAINING_RESOURCE_MAX_BYTES


def resource_extension(filename):
    if not filename:
        return ""
    _, ext = os.path.splitext(filename)
    return ext.lstrip(".").lower()


def kind_for_filename(filename):
    ext = resource_extension(filename)
    return RESOURCE_EXTENSION_KIND.get(ext, RESOURCE_OTHER)


def validate_resource_file(uploaded_file):
    """
    Validate an uploaded file for TrainingResource.

    Returns (ok, error_code_or_none, extension).
    """
    if uploaded_file is None:
        return False, "FILE_REQUIRED", ""
    name = getattr(uploaded_file, "name", "") or ""
    ext = resource_extension(name)
    if not ext or ext not in ALLOWED_RESOURCE_EXTENSIONS:
        return False, "FILE_TYPE_NOT_ALLOWED", ext
    size = getattr(uploaded_file, "size", None)
    if size is not None and size > TRAINING_RESOURCE_MAX_BYTES:
        return False, "FILE_TOO_LARGE", ext
    return True, None, ext


# Types browsers know that mimetypes may miss on some systems.
_EXTRA_TYPES = {
    "m4a": "audio/mp4",
    "oga": "audio/ogg",
    "ogv": "video/ogg",
    "webm": "video/webm",
    "webp": "image/webp",
    "flac": "audio/flac",
}


def content_type_for_filename(filename):
    """
    Type sent back with a file, from its extension only: the type the uploading
    browser declared is not trusted (a page disguised as a PDF must not run).
    """
    ext = resource_extension(filename)
    if ext in _EXTRA_TYPES:
        return _EXTRA_TYPES[ext]
    guessed, _ = mimetypes.guess_type(f"file.{ext}")
    return guessed or "application/octet-stream"


def can_show_inline(filename):
    return resource_extension(filename) in INLINE_RESOURCE_EXTENSIONS


LINK_MAX_LENGTH = 500


def validate_link(url):
    """
    Validate a web link added to a course (YouTube video, website).

    Returns (ok, error_code_or_none, cleaned_url). Only http(s) links are kept:
    anything else (javascript:, data:, file:) could run in the learner's page.
    """
    cleaned = (url or "").strip()
    if not cleaned:
        return False, "URL_REQUIRED", ""
    if len(cleaned) > LINK_MAX_LENGTH:
        return False, "URL_TOO_LONG", ""
    parsed = urlparse(cleaned)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        return False, "URL_NOT_ALLOWED", ""
    return True, None, cleaned

