from flask import Blueprint, request, jsonify
from models import db, Rol
from services.auth_service import check_permission

rol_bp = Blueprint('rol', __name__)

@rol_bp.route('/', methods=['GET'])
def get_roles():
    roles = Rol.query.all()
    return jsonify([r.to_dict() for r in roles])


@rol_bp.route('/<int:id>', methods=['GET'])
def get_rol(id):
    rol = Rol.query.get_or_404(id)
    return jsonify(rol.to_dict())


@rol_bp.route('/', methods=['POST'])
def create_rol():
    data = request.get_json()
    try:
        new_rol = Rol(
            nombre=data['nombre'],
            descripcion=data.get('descripcion')
        )
        db.session.add(new_rol)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Rol creado', 'id': new_rol.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400

@rol_bp.route('/<int:id>', methods=['PUT', 'PATCH'])
def update_rol(id):
    rol = Rol.query.get_or_404(id)
    if not check_permission():
        return jsonify({'status': 'error', 'message': 'No tienes permiso para editar este recurso'}), 403
    
    data = request.get_json()
    try:
        if 'nombre' in data:
            rol.nombre = data['nombre']
        if 'descripcion' in data:
            rol.descripcion = data['descripcion']
            
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Rol actualizado'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400


@rol_bp.route('/<int:id>', methods=['DELETE'])
def delete_rol(id):
    rol = Rol.query.get_or_404(id)
    # Only Admin/Pastor can delete Roles
    if not check_permission():
        return jsonify({'status': 'error', 'message': 'No tienes permiso para eliminar este recurso'}), 403
    
    try:
        db.session.delete(rol)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Rol eliminado'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400
