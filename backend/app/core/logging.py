import logging
from logging.config import dictConfig


def configure_logging(level: str = "INFO") -> None:
    lvl = level.upper()
    dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "default": {
                    "format": "%(asctime)s %(levelname)s %(name)s: %(message)s",
                }
            },
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "formatter": "default",
                }
            },
            "loggers": {
                "": {"handlers": ["console"], "level": lvl},
                "uvicorn": {"handlers": ["console"], "level": lvl, "propagate": False},
                "uvicorn.access": {"handlers": ["console"], "level": lvl, "propagate": False},
            },
        }
    )


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)

