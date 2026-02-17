from flask import Blueprint, request, jsonify
from models import db, OracionRecordatorio
from services.auth_service import check_permission

oracion_recordatorio_bp = Blueprint('oracion_recordatorio', __name__)

@oracion_recordatorio_bp.route('/', methods=['POST'])
def create_recordatorio():
    data = request.get_json()
    try:
        new_recordatorio = OracionRecordatorio(
            id_user=data['id_user'],
            id_oracion=data['id_oracion']
        )
        db.session.add(new_recordatorio)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Recordatorio creado', 'recordatorio': new_recordatorio.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400

@oracion_recordatorio_bp.route('/<int:id>', methods=['DELETE'])
def delete_recordatorio(id):
    recordatorio = OracionRecordatorio.query.get_or_404(id)
    
    if not check_permission(recordatorio.id_user):
        return jsonify({'status': 'error', 'message': 'No tienes permiso para eliminar este recurso'}), 403
    
    try:
        db.session.delete(recordatorio)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Recordatorio eliminado'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400
