import json
from pydantic_settings import BaseSettings
import secrets

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables or a .env file.

    Attributes:
        environment (str): Current environment name (e.g., 'dev', 'prod', 'uat').
        config (str): JSON string or other configuration data loaded from env.
        secret_key (str): Secret key for JWT encoding/decoding
        algorithm (str): JWT algorithm to use
    """

    environment: str = "dev"       # default to 'dev' if not set
    config: str                    # expected to be JSON string or similar
    secret_key: str = secrets.token_urlsafe(32)  # Generate default if not set
    algorithm: str = "HS256"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Instantiate settings (loads variables from .env or OS environment)
settings = Settings()

# Validate required config is present
assert settings.config, "Configuration missing: Please set 'config' in .env or environment variables."

# Example: parse config JSON string into dict
config = json.loads(settings.config)
environment = settings.environment

# Security settings
SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm

# Warn if using default secret key
if settings.secret_key == secrets.token_urlsafe(32):
    import logging
    logging.warning("Using default SECRET_KEY. Set 'secret_key' in .env for production!")