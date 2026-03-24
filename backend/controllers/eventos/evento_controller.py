from flask import Blueprint, request, jsonify
from models import db, Evento
from datetime import datetime
from services.auth_service import check_permission

evento_bp = Blueprint('evento', __name__)

@evento_bp.route('/', methods=['GET'])
def get_eventos():
    eventos = Evento.query.all()
    return jsonify([e.to_dict() for e in eventos])


@evento_bp.route('/<int:id>', methods=['GET'])
def get_evento(id):
    evento = Evento.query.get_or_404(id)
    return jsonify(evento.to_dict())


@evento_bp.route('/', methods=['POST'])
def create_evento():
    data = request.get_json()
    user_id = data.get('id_user')
    
    if not check_permission(user_id):
        return jsonify({'status': 'error', 'message': 'No tienes permiso para crear este recurso para este usuario'}), 403
        
    try:
        new_evento = Evento(
            titulo=data['titulo'],
            descripcion=data.get('descripcion'),
            fecha_inicio=datetime.fromisoformat(data['fecha_inicio']),
            id_area=data['id_area'],
            id_user=user_id,
            fecha_fin=datetime.fromisoformat(data['fecha_fin']) if data.get('fecha_fin') else None,
            aforo_max=data.get('aforo_max'),
            estado=data.get('estado', 1)
        )
        db.session.add(new_evento)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Evento creado', 'id': new_evento.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400

@evento_bp.route('/<int:id>', methods=['PUT', 'PATCH'])
def update_evento(id):
    evento = Evento.query.get_or_404(id)
    if not check_permission(evento.id_user):
        return jsonify({'status': 'error', 'message': 'No tienes permiso para editar este recurso'}), 403
    
    data = request.get_json()
    try:
        if 'titulo' in data:
            evento.titulo = data['titulo']
        if 'descripcion' in data:
            evento.descripcion = data['descripcion']
        if 'fecha_inicio' in data:
            evento.fecha_inicio = datetime.fromisoformat(data['fecha_inicio'])
        if 'fecha_fin' in data:
            evento.fecha_fin = datetime.fromisoformat(data['fecha_fin'])
        if 'id_area' in data:
            evento.id_area = data['id_area']
        if 'aforo_max' in data:
            evento.aforo_max = data['aforo_max']
        if 'estado' in data:
            evento.estado = data['estado']
            
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Evento actualizado'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400


@evento_bp.route('/<int:id>', methods=['DELETE'])
def delete_evento(id):
    evento = Evento.query.get_or_404(id)
    
    if not check_permission(evento.id_user):
        return jsonify({'status': 'error', 'message': 'No tienes permiso para eliminar este recurso'}), 403
    
    try:
        db.session.delete(evento)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Evento eliminado'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400
