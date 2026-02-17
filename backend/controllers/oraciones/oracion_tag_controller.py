from flask import Blueprint, request, jsonify
from models import db, OracionTag

oracion_tag_bp = Blueprint('oracion_tag', __name__)

@oracion_tag_bp.route('/', methods=['POST'])
def add_tag_to_oracion():
    data = request.get_json()
    try:
        new_ot = OracionTag(
            id_oracion=data['id_oracion'],
            id_tag=data['id_tag']
        )
        db.session.add(new_ot)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Etiqueta anadida a la oracion'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400
