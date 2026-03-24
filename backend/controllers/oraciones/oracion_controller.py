from flask import Blueprint, request, jsonify
from models import db, Oracion
from services.auth_service import check_permission

oracion_bp = Blueprint('oracion', __name__)

@oracion_bp.route('/', methods=['GET'])
def get_oraciones():
    oraciones = Oracion.query.all()
    return jsonify([o.to_dict() for o in oraciones])


@oracion_bp.route('/<int:id>', methods=['GET'])
def get_oracion(id):
    oracion = Oracion.query.get_or_404(id)
    return jsonify(oracion.to_dict())


@oracion_bp.route('/', methods=['POST'])
def create_oracion():
    data = request.get_json()
    user_id = data.get('id_user')

    if not check_permission(user_id):
        return jsonify({'status': 'error', 'message': 'No tienes permiso para crear este recurso para este usuario'}), 403

    try:
        new_oracion = Oracion(
            id_user=user_id,
            titulo=data['titulo'],
            contenido=data['contenido'],
            duracion_dias=data.get('duracion_dias'),
            estado=data.get('estado', 1)
        )
        db.session.add(new_oracion)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Peticion de oracion creada', 'id': new_oracion.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400

@oracion_bp.route('/<int:id>', methods=['PUT', 'PATCH'])
def update_oracion(id):
    oracion = Oracion.query.get_or_404(id)
    if not check_permission(oracion.id_user):
        return jsonify({'status': 'error', 'message': 'No tienes permiso para editar este recurso'}), 403
    
    data = request.get_json()
    try:
        if 'titulo' in data:
            oracion.titulo = data['titulo']
        if 'contenido' in data:
            oracion.contenido = data['contenido']
        if 'duracion_dias' in data:
            oracion.duracion_dias = data['duracion_dias']
        if 'estado' in data:
            oracion.estado = data['estado']
            
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Oracion actualizada'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400


@oracion_bp.route('/<int:id>', methods=['DELETE'])
def delete_oracion(id):
    oracion = Oracion.query.get_or_404(id)
    
    if not check_permission(oracion.id_user):
        return jsonify({'status': 'error', 'message': 'No tienes permiso para eliminar este recurso'}), 403
    
    try:
        db.session.delete(oracion)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Oracion eliminada'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400
