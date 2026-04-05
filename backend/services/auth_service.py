from flask_login import current_user

def check_permission(owner_id=None):
    """
    Check if the current_user has permission to perform an action.
    Permission is granted if:
    1. User is authenticated
    2. User is Admin (role 1)
    3. User is Pastor (role 2)
    4. User is the owner of the resource (current_user.id == owner_id)
    """
    if not current_user.is_authenticated:
        return False

    # Efficient way:
    role_ids = [rol.id for rol in current_user.roles]
    
    if 1 in role_ids or 2 in role_ids:
        return True
        
    # Check ownership
    if owner_id is not None:
        try:
            own_id = int(owner_id)
            if current_user.id == own_id:
                return True
        except ValueError:
            pass
        
    return False

def check_banned():
    """
    Returns True if the current user is banned (estado == 3).
    Banned users can only read, not write.
    """
    if not current_user.is_authenticated:
        return False
    return getattr(current_user, 'estado', 1) == 3

def has_area_permission(area_id):
    """
    Checks if current_user can manage/create things in a specific area.
    Granted if:
    1. Is Admin (1) or Pastor (2)
    2. Has a Puesto in that area (id_area)
    """
    if not current_user.is_authenticated:
        return False
    
    # 1. Check global roles
    role_ids = [rol.id for rol in current_user.roles]
    if 1 in role_ids or 2 in role_ids:
        return True
    
    # 2. Check Puesto in area
    if area_id is None:
        return False
        
    try:
        target_area_id = int(area_id)
        user_areas = [p.id_area for p in current_user.puestos if p.estado == 1]
        if target_area_id in user_areas:
            return True
    except (ValueError, TypeError):
        pass
        
    return False

def needs_event_confirmation(area_id):
    """
    Returns True if current_user's events in this area MUST be confirmed by an admin.
    Admins/Pastors NEVER need confirmation.
    """
    if not current_user.is_authenticated:
        return False
    
    # 1. Admins/Pastors are trusted
    role_ids = [rol.id for rol in current_user.roles]
    if 1 in role_ids or 2 in role_ids:
        return False
    
    # 2. Check if any Puesto in this area requires confirmation
    try:
        target_area_id = int(area_id)
        for p in current_user.puestos:
            if p.id_area == target_area_id and p.estado == 1:
                return p.requiere_confirmacion # If True, requires confirmation
    except (ValueError, TypeError):
        pass
        
    return False
