from flask import Blueprint, request, jsonify
from models import db, ReservaEvento
from services.auth_service import check_permission, check_banned

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
def toggle_reserva():
    data = request.get_json()
    user_id = data.get('id_user')
    evento_id = data.get('id_evento')

    if check_banned():
        return jsonify({'status': 'error', 'message': 'Tu cuenta está suspendida. No puedes reservar eventos.'}), 403

    if not check_permission(user_id):
        return jsonify({'status': 'error', 'message': 'No tienes permiso'}), 403

    try:
        from models import Evento
        evento = Evento.query.get_or_404(evento_id)
        
        # Check if event is in the past
        from datetime import datetime
        if evento.fecha_inicio < datetime.utcnow():
            return jsonify({'status': 'error', 'message': 'No puedes reservar un evento que ya ha pasado.'}), 400
        
        # Check if already exists
        reserva = ReservaEvento.query.filter_by(id_user=user_id, id_evento=evento_id).first()
        
        if reserva:
            db.session.delete(reserva)
            db.session.commit()
            return jsonify({'status': 'success', 'message': 'Reserva cancelada', 'action': 'removed'}), 200
        
        # Check capacity
        active_reservas = ReservaEvento.query.filter_by(id_evento=evento_id, estado=1).count()
        if evento.aforo_max and active_reservas >= evento.aforo_max:
            return jsonify({'status': 'error', 'message': 'El evento está lleno'}), 400

        new_reserva = ReservaEvento(
            id_user=user_id,
            id_evento=evento_id,
            estado=1
        )
        db.session.add(new_reserva)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Reserva realizada', 'action': 'added'}), 201
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
