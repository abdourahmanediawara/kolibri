from kolibri.plugins import KolibriPluginBase


class ActionEducationTrainingPlugin(KolibriPluginBase):
    """Trainings, sessions, enrollments, attendance, and certificates."""

    untranslated_view_urls = "api_urls"
    can_manage_while_running = True

    def name(self, lang):
        return "AE Formations"
