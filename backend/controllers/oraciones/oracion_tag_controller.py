from flask import Blueprint, request, jsonify
from models import db, OracionTag, Oracion
from services.auth_service import check_permission

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

@oracion_tag_bp.route('/<int:id_oracion>/<int:id_tag>', methods=['DELETE'])
def remove_tag_from_oracion(id_oracion, id_tag):
    oracion = Oracion.query.get_or_404(id_oracion)
    
    if not check_permission(oracion.id_user):
        return jsonify({'status': 'error', 'message': 'No tienes permiso para eliminar esta etiqueta'}), 403
        
    ot = OracionTag.query.filter_by(id_oracion=id_oracion, id_tag=id_tag).first_or_404()
    try:
        db.session.delete(ot)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Etiqueta eliminada de la oracion'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400
