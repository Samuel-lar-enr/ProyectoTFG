from flask import Blueprint, request, jsonify
from models import db, ReservaEvento
from services.auth_service import check_permission

reserva_evento_bp = Blueprint('reserva_evento', __name__)

@reserva_evento_bp.route('/', methods=['GET'])
def get_reservas():
    reservas = ReservaEvento.query.all()
    return jsonify([r.to_dict() for r in reservas])


@reserva_evento_bp.route('/<int:id>', methods=['GET'])
def get_reserva(id):
    reserva = ReservaEvento.query.get_or_404(id)
    return jsonify(reserva.to_dict())


@reserva_evento_bp.route('/', methods=['POST'])
def create_reserva():
    data = request.get_json()
    try:
        new_reserva = ReservaEvento(
            id_user=data['id_user'],
            id_evento=data['id_evento'],
            estado=data.get('estado', 1)
        )
        db.session.add(new_reserva)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Reserva realizada', 'id': new_reserva.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400

@reserva_evento_bp.route('/<int:id>', methods=['PUT', 'PATCH'])
def update_reserva(id):
    reserva = ReservaEvento.query.get_or_404(id)
    # Only Admin/Pastor or the user who made the reservation can edit (e.g. cancel/confirm)
    if not check_permission(reserva.id_user):
        return jsonify({'status': 'error', 'message': 'No tienes permiso para editar este recurso'}), 403
    
    data = request.get_json()
    try:
        if 'estado' in data:
            reserva.estado = data['estado']
            
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Reserva actualizada'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400


@reserva_evento_bp.route('/<int:id>', methods=['DELETE'])
def delete_reserva(id):
    reserva = ReservaEvento.query.get_or_404(id)
    
    if not check_permission(reserva.id_user):
        return jsonify({'status': 'error', 'message': 'No tienes permiso para eliminar este recurso'}), 403
    
    try:
        db.session.delete(reserva)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Reserva eliminada'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400
