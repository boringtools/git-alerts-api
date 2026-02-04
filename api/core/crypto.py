from cryptography.fernet import Fernet
from django.conf import settings

fernet = Fernet(settings.ENCRYPTION_KEY)

def encypt(value: str) -> str:
    """Encrypts a string using Fernet symmetric encryption"""
    if value is None:
        return None
    return fernet.encrypt(value.encode()).decode()

def decrypt(value: str) -> str:
    """Decrypts a string encrypted with Fernet"""
    if value is None:
        return None
    return fernet.decrypt(value.encode()).decode()
