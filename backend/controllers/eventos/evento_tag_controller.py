from flask import Blueprint, request, jsonify
from models import db, EventoTag

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
