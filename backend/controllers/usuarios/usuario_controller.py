from flask import Blueprint, request, jsonify
from models import db, Usuario, Rol
from services.auth_service import check_permission
from services.file_service import save_image, delete_image

usuario_bp = Blueprint('usuario', __name__)

@usuario_bp.route('/', methods=['GET'])
def get_usuarios():
    usuarios = Usuario.query.all()
    return jsonify([u.to_dict() for u in usuarios])

@usuario_bp.route('/<int:id>', methods=['GET'])
def get_usuario(id):
    usuario = Usuario.query.get_or_404(id)
    return jsonify(usuario.to_dict())

@usuario_bp.route('/', methods=['POST'])
def create_usuario():
    data = request.get_json()
    try:
        new_usuario = Usuario(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            notificaciones=data.get('notificaciones', False)
        )
        
        roles_names = data.get('roles', [])
        if roles_names:
            found_roles = Rol.query.filter(Rol.nombre.in_(roles_names)).all()
            new_usuario.roles = found_roles
            
        db.session.add(new_usuario)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Usuario creado', 'id': new_usuario.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400

@usuario_bp.route('/<int:id>', methods=['PUT', 'PATCH'])
def update_usuario(id):
    usuario = Usuario.query.get_or_404(id)
    if not check_permission(id):
        return jsonify({'status': 'error', 'message': 'No tienes permiso para actualizar este usuario'}), 403

    if request.is_json:
        data = request.get_json()
    else:
        data = request.form

    try:
        if 'username' in data:
            usuario.username = data['username']
        if 'email' in data:
            usuario.email = data['email']
        
        # Manejo de avatar
        if 'file' in request.files:
            # Borrar avatar anterior si existía y era local
            if usuario.avatar and usuario.avatar.startswith('/uploads/'):
                delete_image(usuario.avatar)
            usuario.avatar = save_image(request.files['file'], folder='avatars')
        elif 'avatar' in data:
            # Si mandan avatar como string, actualizamos (puede ser URL externa o null)
            if data['avatar'] != usuario.avatar:
                if usuario.avatar and usuario.avatar.startswith('/uploads/'):
                    delete_image(usuario.avatar)
                usuario.avatar = data['avatar']

        if 'password' in data and data['password']:
            usuario.set_password(data['password'])
        if 'notificaciones' in data:
            # En multipart, el booleano puede venir como string 'true'/'false'
            val = data['notificaciones']
            if isinstance(val, str):
                usuario.notificaciones = val.lower() == 'true'
            else:
                usuario.notificaciones = bool(val)
            
        if 'roles' in data:
            import json
            roles_data = data['roles']
            if isinstance(roles_data, str):
                try:
                    roles_data = json.loads(roles_data)
                except:
                    roles_data = [r.strip() for r in roles_data.split(',')]
            
            roles_names = []
            if isinstance(roles_data, list):
                for r in roles_data:
                    if isinstance(r, dict) and 'nombre' in r:
                        roles_names.append(r['nombre'])
                    elif isinstance(r, str):
                        roles_names.append(r)
            
            # Buscamos los roles en la base de datos y los asignamos
            found_roles = Rol.query.filter(Rol.nombre.in_(roles_names)).all()
            usuario.roles = found_roles
            
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Usuario actualizado'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': f"Error al actualizar: {str(e)}"}), 400

@usuario_bp.route('/<int:id>', methods=['DELETE'])
def delete_usuario(id):
    usuario = Usuario.query.get_or_404(id)
    # Usuario can delete their own account (requester_id == usuario.id) or Admin/Pastor
    if not check_permission(usuario.id):
        return jsonify({'status': 'error', 'message': 'No tienes permiso para eliminar este recurso'}), 403
    
    try:
        db.session.delete(usuario)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Usuario eliminado'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400

@usuario_bp.route('/<int:id>/ban', methods=['PATCH'])
def ban_usuario(id):
    from flask_login import current_user as cu
    # Solo admin/pastor pueden banear
    role_names = [rol.nombre.lower() for rol in cu.roles] if cu.is_authenticated else []
    if 'administrador' not in role_names and 'pastor' not in role_names:
        return jsonify({'status': 'error', 'message': 'No tienes permiso para banear usuarios'}), 403

    usuario = Usuario.query.get_or_404(id)

    # No puede banearse a sí mismo ni a otro admin
    if usuario.id == cu.id:
        return jsonify({'status': 'error', 'message': 'No puedes banearte a ti mismo'}), 400
    target_role_names = [rol.nombre.lower() for rol in usuario.roles]
    if 'administrador' in target_role_names:
        return jsonify({'status': 'error', 'message': 'No puedes banear a un administrador'}), 400

    # Toggle: 1 -> 3 (ban), 3 -> 1 (unban)
    if usuario.estado == 3:
        usuario.estado = 1
        msg = 'Usuario desbaneado correctamente'
        action = 'unbanned'
    else:
        usuario.estado = 3
        msg = 'Usuario baneado correctamente'
        action = 'banned'

    try:
        db.session.commit()
        return jsonify({'status': 'success', 'message': msg, 'action': action, 'nuevo_estado': usuario.estado}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400
