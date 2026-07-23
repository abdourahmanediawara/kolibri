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
