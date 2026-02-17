from flask import Blueprint, request, jsonify
from models import db, Puesto
from services.auth_service import check_permission

puesto_bp = Blueprint('puesto', __name__)

@puesto_bp.route('/', methods=['GET'])
def get_puestos():
    puestos = Puesto.query.all()
    return jsonify([p.to_dict() for p in puestos])


@puesto_bp.route('/<int:id>', methods=['GET'])
def get_puesto(id):
    puesto = Puesto.query.get_or_404(id)
    return jsonify(puesto.to_dict())


@puesto_bp.route('/', methods=['POST'])
def create_puesto():
    data = request.get_json()
    try:
        new_puesto = Puesto(
            id_user=data['id_user'],
            id_area=data['id_area'],
            id_rol=data['id_rol'],
            requiere_confirmacion=data.get('requiere_confirmacion', False),
            estado=data.get('estado', 1)
        )
        db.session.add(new_puesto)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Puesto creado', 'id': new_puesto.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400

@puesto_bp.route('/<int:id>', methods=['PUT', 'PATCH'])
def update_puesto(id):
    puesto = Puesto.query.get_or_404(id)
    if not check_permission(puesto.id_user):
        return jsonify({'status': 'error', 'message': 'No tienes permiso para editar este recurso'}), 403
    
    data = request.get_json()
    try:
        if 'id_area' in data:
            puesto.id_area = data['id_area']
        if 'id_rol' in data:
            puesto.id_rol = data['id_rol']
        if 'requiere_confirmacion' in data:
            puesto.requiere_confirmacion = data['requiere_confirmacion']
        if 'estado' in data:
            puesto.estado = data['estado']
            
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Puesto actualizado'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400


@puesto_bp.route('/<int:id>', methods=['DELETE'])
def delete_puesto(id):
    puesto = Puesto.query.get_or_404(id)
    
    if not check_permission(puesto.id_user):
        return jsonify({'status': 'error', 'message': 'No tienes permiso para eliminar este recurso'}), 403
    
    try:
        db.session.delete(puesto)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Puesto eliminado'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400
