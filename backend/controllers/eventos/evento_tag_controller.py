from flask import Blueprint, request, jsonify
from models import db, EventoTag, Evento
from services.auth_service import check_permission

evento_tag_bp = Blueprint('evento_tag', __name__)

@evento_tag_bp.route('/', methods=['POST'])
def add_tag_to_evento():
    data = request.get_json()
    try:
        new_et = EventoTag(
            id_evento=data['id_evento'],
            id_tag=data['id_tag']
        )
        db.session.add(new_et)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Etiqueta anadida al evento'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400

@evento_tag_bp.route('/<int:id_evento>/<int:id_tag>', methods=['DELETE'])
def remove_tag_from_evento(id_evento, id_tag):
    evento = Evento.query.get_or_404(id_evento)
    
    if not check_permission(evento.id_user):
        return jsonify({'status': 'error', 'message': 'No tienes permiso para eliminar esta etiqueta'}), 403
        
    et = EventoTag.query.filter_by(id_evento=id_evento, id_tag=id_tag).first_or_404()
    try:
        db.session.delete(et)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Etiqueta eliminada del evento'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400
