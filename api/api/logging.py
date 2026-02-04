import os

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,

    "formatters": {
        "default": {
            "format": "%(asctime)s %(levelname)s %(name)s %(message)s",
        },
        "structured": {
            "format": "%(asctime)s level=%(levelname)s logger=%(name)s %(message)s",
        },
    },

    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "structured",
        },
        "file": {
            "class": "logging.FileHandler",
            "filename": "logs/application.log",
            "formatter": "structured",
        },
    },

    "root": {
        "handlers": ["console", "file"],
        "level": LOG_LEVEL,
    },
}
