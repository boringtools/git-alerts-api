import os


class ConfigError(Exception):
    """Raised when required environment variables are missing or invalid."""

    pass


class Config:
    """Validate environment variables"""

    @staticmethod
    def get_env(key: str, required: bool = True) -> str:
        value = os.getenv(key)
        if required and not value:
            raise ConfigError(f"Missing required environment variable: {key}")
        return value

    @staticmethod
    def get_bool(key: str, default=False) -> bool:
        value = os.getenv(key)
        if value is None:
            return default
        value = value.lower()

        if value in ("true", "1", "yes"):
            return True
        elif value in ("false", "0", "no"):
            return False
        else:
            raise ConfigError(f"Invalid boolean for {key}: {value}")

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
