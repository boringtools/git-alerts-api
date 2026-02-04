from django.contrib import admin
from .models import Finding, IgnoreFindingType, IgnoreFindingDomain

@admin.register(Finding)
class FindingAdmin(admin.ModelAdmin):
    list_display = ("type", "value", "email", "repository", "scan", "validated", "created_at")
    list_filter = ("type", "value", "email", "repository", "scan", "validated", "created_at")
    search_fields = ("repository", "email", "description", "value", "commit_hash")
    ordering = ("-created_at",)

admin.site.register(IgnoreFindingType)
admin.site.register(IgnoreFindingDomain)
