from django.db import models
from django.contrib.auth.models import User
from core.crypto import encypt, decrypt

class UserIntegration(models.Model):
    """Model for integrating with third party services at user level"""
    
    class Provider(models.TextChoices):
        GITHUB = "github", "GitHub"
        SLACK = "slack", "Slack"
    
    class Status(models.TextChoices):
        CONNECTED = "connected", "Connected",
        DISCONNECTED = "disconnected", "Disconnected"
        PENDING = "pending", "Pending"
        FAILED = "failed", "Failed"
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="integrations")
    provider = models.CharField(max_length=255, choices=Provider.choices)
    status = models.CharField(max_length=255, choices=Status.choices, default=Status.DISCONNECTED)

    token_encrypted = models.TextField()

    # Token validation tracking
    last_validated_at = models.DateTimeField(null=True, blank=True, help_text="Last time the token was validated")
    error_message = models.TextField(blank=True, default='', help_text="Error message if validation failed")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def set_token(self, token: str) -> None:
        self.token_encrypted = encypt(token)
    
    def get_token(self) -> str:
        return decrypt(self.token_encrypted)
    
    def __str__(self):
        return f"{self.user.username} - {self.provider} - {self.status}"
    
    class Meta:
        verbose_name = "Integration"
        verbose_name_plural = "Integrtions"
        ordering = ["-created_at"]


    

