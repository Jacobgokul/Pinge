from slowapi import Limiter
from slowapi.util import get_remote_address
import re

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)


def validate_password_complexity(password: str) -> bool:
    """
    Validate password complexity.
    
    Checks for:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
    - At least one special character
    """
    if len(password) < 8:
        return False
        
    if not re.search(r"[A-Z]", password):
        return False
        
    if not re.search(r"[a-z]", password):
        return False
        
    if not re.search(r"\d", password):
        return False
        
    if not re.search(r"[ !@#$%^&*()_+\-=\[\]{};':\"\\|,.<>/?]", password):
        return False
        
    return True
