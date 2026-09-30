# Training lifecycle statuses
STATUS_DRAFT = "draft"
STATUS_PUBLISHED = "published"
STATUS_ARCHIVED = "archived"

TRAINING_STATUS_CHOICES = (
    (STATUS_DRAFT, "Draft"),
    (STATUS_PUBLISHED, "Published"),
    (STATUS_ARCHIVED, "Archived"),
)

# Session statuses
SESSION_SCHEDULED = "scheduled"
SESSION_IN_PROGRESS = "in_progress"
SESSION_COMPLETED = "completed"
SESSION_CANCELLED = "cancelled"

SESSION_STATUS_CHOICES = (
    (SESSION_SCHEDULED, "Scheduled"),
    (SESSION_IN_PROGRESS, "In progress"),
    (SESSION_COMPLETED, "Completed"),
    (SESSION_CANCELLED, "Cancelled"),
)

# Enrollment statuses
ENROLLMENT_ACTIVE = "active"
ENROLLMENT_WITHDRAWN = "withdrawn"
ENROLLMENT_COMPLETED = "completed"

ENROLLMENT_STATUS_CHOICES = (
    (ENROLLMENT_ACTIVE, "Active"),
    (ENROLLMENT_WITHDRAWN, "Withdrawn"),
    (ENROLLMENT_COMPLETED, "Completed"),
)

# Attendance statuses
ATTENDANCE_PRESENT = "present"
ATTENDANCE_ABSENT = "absent"
ATTENDANCE_LATE = "late"
ATTENDANCE_EXCUSED = "excused"

ATTENDANCE_STATUS_CHOICES = (
    (ATTENDANCE_PRESENT, "Present"),
    (ATTENDANCE_ABSENT, "Absent"),
    (ATTENDANCE_LATE, "Late"),
    (ATTENDANCE_EXCUSED, "Excused"),
)

# Course resource kinds (Moodle-like attachments on a Training)
RESOURCE_DOCUMENT = "document"
RESOURCE_VIDEO = "video"
RESOURCE_AUDIO = "audio"
RESOURCE_IMAGE = "image"
RESOURCE_SPREADSHEET = "spreadsheet"
RESOURCE_PRESENTATION = "presentation"
RESOURCE_ARCHIVE = "archive"
RESOURCE_LINK = "link"
RESOURCE_OTHER = "other"

RESOURCE_KIND_CHOICES = (
    (RESOURCE_DOCUMENT, "Document"),
    (RESOURCE_VIDEO, "Video"),
    (RESOURCE_AUDIO, "Audio"),
    (RESOURCE_IMAGE, "Image"),
    (RESOURCE_SPREADSHEET, "Spreadsheet"),
    (RESOURCE_PRESENTATION, "Presentation"),
    (RESOURCE_ARCHIVE, "Archive"),
    (RESOURCE_LINK, "Link"),
    (RESOURCE_OTHER, "Other"),
)

# Max upload size for course files (500 MiB): trainers upload whole lesson videos.
TRAINING_RESOURCE_MAX_BYTES = 500 * 1024 * 1024

# Extension → kind mapping for coach uploads.
RESOURCE_EXTENSION_KIND = {
    # Documents
    "pdf": RESOURCE_DOCUMENT,
    "doc": RESOURCE_DOCUMENT,
    "docx": RESOURCE_DOCUMENT,
    "odt": RESOURCE_DOCUMENT,
    "rtf": RESOURCE_DOCUMENT,
    "txt": RESOURCE_DOCUMENT,
    "epub": RESOURCE_DOCUMENT,
    # Spreadsheets
    "xls": RESOURCE_SPREADSHEET,
    "xlsx": RESOURCE_SPREADSHEET,
    "ods": RESOURCE_SPREADSHEET,
    "csv": RESOURCE_SPREADSHEET,
    # Presentations
    "ppt": RESOURCE_PRESENTATION,
    "pptx": RESOURCE_PRESENTATION,
    "odp": RESOURCE_PRESENTATION,
    # Video
    "mp4": RESOURCE_VIDEO,
    "webm": RESOURCE_VIDEO,
    "ogv": RESOURCE_VIDEO,
    "mov": RESOURCE_VIDEO,
    "mkv": RESOURCE_VIDEO,
    # Audio
    "mp3": RESOURCE_AUDIO,
    "ogg": RESOURCE_AUDIO,
    "oga": RESOURCE_AUDIO,
    "wav": RESOURCE_AUDIO,
    "m4a": RESOURCE_AUDIO,
    "flac": RESOURCE_AUDIO,
    # Images
    "jpg": RESOURCE_IMAGE,
    "jpeg": RESOURCE_IMAGE,
    "png": RESOURCE_IMAGE,
    "gif": RESOURCE_IMAGE,
    "webp": RESOURCE_IMAGE,
    "svg": RESOURCE_IMAGE,
    # Archives
    "zip": RESOURCE_ARCHIVE,
    "7z": RESOURCE_ARCHIVE,
    "rar": RESOURCE_ARCHIVE,
}

ALLOWED_RESOURCE_EXTENSIONS = frozenset(RESOURCE_EXTENSION_KIND.keys())

# Kinds a browser can show inside the page; others are downloaded.
# SVG is left out on purpose: it can carry scripts.
INLINE_RESOURCE_EXTENSIONS = frozenset(
    (
        "pdf",
        "txt",
        "mp4",
        "webm",
        "ogv",
        "mov",
        "mp3",
        "ogg",
        "oga",
        "wav",
        "m4a",
        "flac",
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
    )
)

# Quizzes: mini quizzes along the course and a final exam.
QUIZ_KIND_QUIZ = "quiz"
QUIZ_KIND_EXAM = "exam"

QUIZ_KIND_CHOICES = (
    (QUIZ_KIND_QUIZ, "Quiz"),
    (QUIZ_KIND_EXAM, "Final exam"),
)

QUESTION_SINGLE = "single"
QUESTION_MULTIPLE = "multiple"
QUESTION_TRUE_FALSE = "true_false"

QUESTION_KIND_CHOICES = (
    (QUESTION_SINGLE, "Single choice"),
    (QUESTION_MULTIPLE, "Multiple choice"),
    (QUESTION_TRUE_FALSE, "True or false"),
)

QUIZ_DEFAULT_PASS_PERCENT = 50
