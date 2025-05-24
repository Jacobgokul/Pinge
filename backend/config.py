import json
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables or a .env file.

    Attributes:
        environment (str): Current environment name (e.g., 'dev', 'prod', 'uat').
        config (str): JSON string or other configuration data loaded from env.
    """

    environment: str = "dev"       # default to 'dev' if not set
    config: str                    # expected to be JSON string or similar

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