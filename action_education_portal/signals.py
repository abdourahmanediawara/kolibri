"""
Action Éducation: centre admins also manage the server's content library.

Kolibri only lets users with the device permission ``can_manage_content``
import channels. Each centre runs its own server, so its admins get that
permission with their admin role and lose it with the role. Admins who existed
before this rule (or who arrive through a sync) get it at their next login.
"""
from django.contrib.auth.signals import user_logged_in
from django.core.cache import cache
from django.db.models.signals import post_delete
from django.db.models.signals import post_save
from django.dispatch import receiver

from kolibri.core.auth.constants import role_kinds
from kolibri.core.auth.middleware import USER_SESSION_CACHE_KEY
from kolibri.core.auth.models import Role
from kolibri.core.device.models import DevicePermissions


def _is_admin(user_id):
    return Role.objects.filter(user_id=user_id, kind=role_kinds.ADMIN).exists()


def _forget_cached_user(user_id):
    # The session middleware caches each user with their device permissions.
    cache.delete(USER_SESSION_CACHE_KEY.format(user_id))


def _grant_content_permission(user_id):
    permissions, created = DevicePermissions.objects.get_or_create(
        user_id=user_id, defaults={"can_manage_content": True}
    )
    if not created and not permissions.can_manage_content:
        permissions.can_manage_content = True
        permissions.save()
    _forget_cached_user(user_id)


@receiver(post_save, sender=Role)
def grant_content_permission_to_new_admin(sender, instance, **kwargs):
    if instance.kind == role_kinds.ADMIN:
        _grant_content_permission(instance.user_id)


@receiver(post_delete, sender=Role)
def revoke_content_permission_from_former_admin(sender, instance, **kwargs):
    if instance.kind != role_kinds.ADMIN or _is_admin(instance.user_id):
        return
    permissions = DevicePermissions.objects.filter(user_id=instance.user_id)
    # Superusers keep every permission of the device.
    permissions.filter(is_superuser=False).update(can_manage_content=False)
    _forget_cached_user(instance.user_id)


@receiver(user_logged_in)
def grant_content_permission_to_admin_at_login(sender, user, **kwargs):
    if _is_admin(user.id):
        _grant_content_permission(user.id)
