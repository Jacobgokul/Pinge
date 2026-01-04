from enum import Enum

class GenderEnum(Enum):
    Male = "Male"
    Female = "Female"
    Others = "Others"
    
class ContactRequestStatus(Enum):
    Pending = "Pending"
    Accepted = "Accepted"
    Rejected = "Rejected"

class GroupRole(Enum):
    Admin = "Admin"
    Member = "Member"