from flask import Blueprint, request, jsonify
from models import db, Usuario
from services.auth_service import check_permission

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
            password=data['password']
        )
        db.session.add(new_usuario)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Usuario creado', 'id': new_usuario.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400

@usuario_bp.route('/<int:id>', methods=['PUT', 'PATCH'])
def update_usuario(id):
    usuario = Usuario.query.get_or_404(id)
    if not check_permission(usuario.id):
        return jsonify({'status': 'error', 'message': 'No tienes permiso para editar este recurso'}), 403
    
    data = request.get_json()
    try:
        if 'username' in data:
            usuario.username = data['username']
        if 'email' in data:
            usuario.email = data['email']
        if 'password' in data:
            # Note: The Usuario model should handle hashing if possible, 
            # or it should be done here if not in the model.
            usuario.password = data['password']
            
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Usuario actualizado'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400


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
