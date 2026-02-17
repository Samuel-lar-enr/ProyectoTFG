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

    # Check for Admin (1) or Pastor (2) roles
    # Assuming get_roles returns list of role names or objects, but here we check IDs via relationship
    # Let's check IDs directly from the relationship to be consistent with previous logic
    # Previous logic: roles = UsuarioRol.query.filter_by(id_user=req_id).all(); role_ids = [r.id_rol for r in roles]
    
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
