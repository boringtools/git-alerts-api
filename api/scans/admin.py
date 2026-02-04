from django.contrib import admin
from .models import Scan

@admin.register(Scan)
class ScanAdmin(admin.ModelAdmin):
    list_display = ("user", "type", "value", "status", "created_at", "completed_at")
    list_filter = ("user", "type", "value", "status", "created_at", "completed_at")
    search_fields = ("user__username", "value", "type")
    ordering = ("-created_at",)
