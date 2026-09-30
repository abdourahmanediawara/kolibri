"""
Course supports (Moodle-style TrainingResource): uploaded files and web links.

Admins and the trainer the course is assigned to add and remove supports;
learners of the facility read the supports of published courses.
"""

import os
import re

from django.http import FileResponse
from django.http import HttpResponse
from django.http import StreamingHttpResponse
from rest_framework import status
from rest_framework.parsers import FormParser
from rest_framework.parsers import JSONParser
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from action_education_training.constants import RESOURCE_LINK
from action_education_training.constants import STATUS_PUBLISHED
from action_education_training.models import ResourceView
from action_education_training.models import Training
from action_education_training.models import TrainingResource
from action_education_training.permissions import _is_facility_staff
from action_education_training.permissions import can_manage_training_content
from action_education_training.permissions import IsFacilityStaffOrReadOwn
from action_education_training.resource_utils import can_show_inline
from action_education_training.resource_utils import content_type_for_filename
from action_education_training.resource_utils import kind_for_filename
from action_education_training.resource_utils import validate_link
from action_education_training.resource_utils import validate_resource_file
from action_education_training.serializers import TrainingResourceSerializer
from kolibri.core.api import ValuesViewset
from kolibri.utils.time_utils import local_now

# Byte ranges let video and audio players seek without downloading the whole file.
RANGE_PATTERN = re.compile(r"^bytes=(\d*)-(\d*)$")
RANGE_CHUNK_BYTES = 64 * 1024


def _error(code, http_status, **metadata):
    return Response([{"id": code, "metadata": metadata}], status=http_status)


def _training_for_user(user, training_id):
    qs = Training.objects.filter(id=training_id, facility_id=user.facility_id)
    if not _is_facility_staff(user):
        qs = qs.filter(status=STATUS_PUBLISHED)
    return qs.first()


def _resources_for_user(user):
    qs = TrainingResource.objects.select_related("training")
    if _is_facility_staff(user):
        return qs.filter(training__facility_id=user.facility_id)
    return qs.filter(
        training__facility_id=user.facility_id,
        training__status=STATUS_PUBLISHED,
    )


def _training_to_manage(request):
    """The course named in the request, if this user may change its supports."""
    training_id = (request.data.get("training") or "").strip()
    if not training_id:
        return None, Response(
            {"training": ["This field is required."]},
            status=status.HTTP_400_BAD_REQUEST,
        )
    training = _training_for_user(request.user, training_id)
    if training is None:
        return None, _error("NOT_FOUND", status.HTTP_404_NOT_FOUND, field="training")
    if not can_manage_training_content(request.user, training):
        return None, _error(
            "PERMISSION_DENIED", status.HTTP_403_FORBIDDEN, view="AE Course supports"
        )
    return training, None


class TrainingResourceViewSet(ValuesViewset):
    permission_classes = (IsFacilityStaffOrReadOwn,)
    serializer_class = TrainingResourceSerializer
    values = (
        "id",
        "training_id",
        "title",
        "kind",
        "original_filename",
        "mime_type",
        "size_bytes",
        "url",
        "uploaded_by_id",
        "sort_order",
        "date_created",
    )
    field_map = {
        "training": "training_id",
        "uploaded_by": "uploaded_by_id",
    }

    def get_queryset(self):
        qs = _resources_for_user(self.request.user)
        training_id = self.request.query_params.get("training")
        if training_id:
            qs = qs.filter(training_id=training_id)
        return qs

    def consolidate(self, items, queryset):
        """Tells each person which supports they already opened."""
        opened = set(
            ResourceView.objects.filter(
                learner_id=self.request.user.id,
                resource_id__in=[item["id"] for item in items],
            ).values_list("resource_id", flat=True)
        )
        for item in items:
            item["viewed"] = item["id"] in opened
        return items

    def create(self, request, *args, **kwargs):
        return _error(
            "METHOD_NOT_ALLOWED",
            status.HTTP_405_METHOD_NOT_ALLOWED,
            detail="Use POST /api/resource/upload/ or /api/resource/link/",
        )

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if not can_manage_training_content(request.user, instance.training):
            return _error(
                "PERMISSION_DENIED", status.HTTP_403_FORBIDDEN, view="AE Update Resource"
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if not can_manage_training_content(request.user, instance.training):
            return _error(
                "PERMISSION_DENIED", status.HTTP_403_FORBIDDEN, view="AE Delete Resource"
            )
        file_field = instance.file
        instance.delete()
        if file_field:
            file_field.delete(save=False)
        return Response(status=status.HTTP_204_NO_CONTENT)


class TrainingResourceUploadView(APIView):
    permission_classes = (IsFacilityStaffOrReadOwn,)
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        if not _is_facility_staff(request.user):
            return _error(
                "PERMISSION_DENIED", status.HTTP_403_FORBIDDEN, view="AE Upload Resource"
            )
        training, error = _training_to_manage(request)
        if error:
            return error

        uploaded = request.FILES.get("file")
        ok, error_code, _ext = validate_resource_file(uploaded)
        if not ok:
            return _error(error_code, status.HTTP_400_BAD_REQUEST, field="file")

        original_name = uploaded.name or "file"
        title = (request.data.get("title") or "").strip()
        if not title:
            title = original_name.rsplit(".", 1)[0][:200] or "Ressource"

        resource = TrainingResource(
            training=training,
            title=title[:200],
            kind=kind_for_filename(original_name),
            original_filename=original_name[:255],
            mime_type=content_type_for_filename(original_name)[:127],
            size_bytes=int(getattr(uploaded, "size", 0) or 0),
            uploaded_by=request.user,
            sort_order=training.resources.count(),
        )
        resource.file = uploaded
        resource.save()
        return Response(
            TrainingResourceSerializer(resource).data, status=status.HTTP_201_CREATED
        )


class TrainingResourceLinkView(APIView):
    """Adds a web link (YouTube video, website) to a course."""

    permission_classes = (IsFacilityStaffOrReadOwn,)
    parser_classes = (JSONParser, FormParser)

    def post(self, request):
        if not _is_facility_staff(request.user):
            return _error(
                "PERMISSION_DENIED", status.HTTP_403_FORBIDDEN, view="AE Add Link"
            )
        training, error = _training_to_manage(request)
        if error:
            return error

        ok, error_code, url = validate_link(request.data.get("url"))
        if not ok:
            return _error(error_code, status.HTTP_400_BAD_REQUEST, field="url")
        title = (request.data.get("title") or "").strip()[:200] or url[:200]

        resource = TrainingResource.objects.create(
            training=training,
            title=title,
            kind=RESOURCE_LINK,
            url=url,
            uploaded_by=request.user,
            sort_order=training.resources.count(),
        )
        return Response(
            TrainingResourceSerializer(resource).data, status=status.HTTP_201_CREATED
        )


class ResourceViewedView(APIView):
    """A learner opened a support: it counts for their course progress."""

    # Learners write here: any signed-in user, on the supports they can read.
    permission_classes = (IsAuthenticated,)

    def post(self, request, pk):
        user = request.user
        resource = _resources_for_user(user).filter(id=pk).first()
        if resource is None:
            return _error("NOT_FOUND", status.HTTP_404_NOT_FOUND)
        view, created = ResourceView.objects.get_or_create(resource=resource, learner=user)
        if not created:
            view.last_viewed = local_now()
            view.save(update_fields=["last_viewed"])
        return Response(
            {"resource": resource.id, "first_viewed": created},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


def _ranged_response(file_handle, size, range_header, content_type):
    """206 answer for "Range: bytes=start-end", or None when the range is unusable."""
    match = RANGE_PATTERN.match(range_header.strip())
    if not match or size == 0:
        return None
    start_text, end_text = match.groups()
    if start_text == "" and end_text == "":
        return None
    if start_text == "":
        # "bytes=-500": the last 500 bytes.
        length = min(int(end_text), size)
        start, end = size - length, size - 1
    else:
        start = int(start_text)
        end = min(int(end_text), size - 1) if end_text else size - 1
    if start >= size or start > end:
        response = HttpResponse(status=416)
        response["Content-Range"] = f"bytes */{size}"
        return response

    def stream():
        file_handle.seek(start)
        remaining = end - start + 1
        while remaining > 0:
            chunk = file_handle.read(min(RANGE_CHUNK_BYTES, remaining))
            if not chunk:
                break
            remaining -= len(chunk)
            yield chunk
        file_handle.close()

    response = StreamingHttpResponse(stream(), status=206, content_type=content_type)
    response["Content-Range"] = f"bytes {start}-{end}/{size}"
    response["Content-Length"] = str(end - start + 1)
    return response


class TrainingResourceDownloadView(APIView):
    """
    Sends a course file. With ?inline=1, videos, audio, images and PDFs open in the
    page (and players can seek); other files, and SVG, are always downloaded.
    """

    permission_classes = (IsFacilityStaffOrReadOwn,)

    def get(self, request, pk):
        resource = _resources_for_user(request.user).filter(id=pk).first()
        if resource is None:
            return _error("NOT_FOUND", status.HTTP_404_NOT_FOUND)
        if not resource.file:
            return _error("FILE_MISSING", status.HTTP_404_NOT_FOUND)

        filename = resource.original_filename or resource.title
        content_type = content_type_for_filename(filename)
        inline = request.query_params.get("inline") == "1" and can_show_inline(filename)
        file_handle = resource.file.open("rb")
        size = resource.file.size

        response = None
        range_header = request.META.get("HTTP_RANGE")
        if inline and range_header:
            response = _ranged_response(file_handle, size, range_header, content_type)
        if response is None:
            response = FileResponse(
                file_handle,
                as_attachment=not inline,
                filename=os.path.basename(filename),
                content_type=content_type,
            )
        response["Accept-Ranges"] = "bytes" if inline else "none"
        # Never let the browser guess another type, nor run what the file holds.
        # PDFs are left to the browser's own viewer, which a sandbox would block.
        response["X-Content-Type-Options"] = "nosniff"
        if content_type != "application/pdf":
            response["Content-Security-Policy"] = "sandbox; default-src 'none'"
        return response
