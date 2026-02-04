from django.contrib import admin
from .models import RepoScanHistory, SystemSettings

admin.site.register(RepoScanHistory)
admin.site.register(SystemSettings)
