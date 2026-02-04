import os
import shutil

class ConfigError(Exception):
    """Raised when required environment variables are missing or invalid."""
    pass

class Config():
    """Validate Django settings and enviornment variables"""
    @staticmethod
    def get_env(key: str, required: bool=True) -> str:
        value = os.getenv(key)
        if required and not value:
            raise ConfigError(
                f"Missing required enviornment variable: {key}"
            )
        return value
    
    @staticmethod
    def get_bool(key: str, default=False) -> bool:
        value = os.getenv(key)
        if value is None:
            return default
        value = value.lower()

        if value in ("True", "true"):
            return True
        elif value in ("False", "false"):
            return False
        else:
            ConfigError("Invalid boolean for {key}: {value}")
    
    @staticmethod
    def get_int(key: str, default=None) -> int:
        value = os.getenv(key)
        if value is None:
            return default
        try:
            return int(value)
        except ValueError:
            raise ConfigError(f"Invalid integer for {key}: {value}")
    
    @staticmethod
    def get_list(key: str, default=None) -> list:
        value = os.getenv(key)
        if value is None:
            return default or []
        return value.split(",")
    
    @staticmethod
    def require_executable(name: str):
        """Ensure a CLI tool like trufflehog is installed."""
        if shutil.which(name) is None:
            raise ConfigError(f"Executable '{name}' is required but not found in PATH.")





