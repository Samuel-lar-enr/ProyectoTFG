from flask import Blueprint, request, jsonify
from models import db, OracionRecordatorio, Oracion
from services.auth_service import check_permission

oracion_recordatorio_bp = Blueprint('oracion_recordatorio', __name__)

@oracion_recordatorio_bp.route('/', methods=['GET'])
def get_user_recordatorios():
    user_id = request.args.get('user_id', type=int)
    if not user_id:
        return jsonify({'status': 'error', 'message': 'user_id es requerido'}), 400
    
    recordatorios = OracionRecordatorio.query.filter_by(id_user=user_id).all()
    return jsonify([r.to_dict() for r in recordatorios])

@oracion_recordatorio_bp.route('/toggle', methods=['POST'])
def toggle_recordatorio():
    data = request.get_json()
    user_id = data.get('id_user')
    oracion_id = data.get('id_oracion')

    if not user_id or not oracion_id:
        return jsonify({'status': 'error', 'message': 'Faltan datos'}), 400

    if not check_permission(user_id):
        return jsonify({'status': 'error', 'message': 'No autorizado'}), 403

    # Buscar si ya existe
    existing = OracionRecordatorio.query.filter_by(id_user=user_id, id_oracion=oracion_id).first()

    try:
        if existing:
            db.session.delete(existing)
            db.session.commit()
            return jsonify({'status': 'success', 'message': 'Recordatorio eliminado', 'action': 'removed'}), 200
        else:
            # Verificar que la oración esté activa antes de permitir recordarla
            oracion = Oracion.query.get(oracion_id)
            if not oracion or oracion.estado != 1:
                return jsonify({'status': 'error', 'message': 'Solo puedes recordar oraciones activas'}), 400
                
            new_r = OracionRecordatorio(id_user=user_id, id_oracion=oracion_id)
            db.session.add(new_r)
            db.session.commit()
            return jsonify({'status': 'success', 'message': 'Recordatorio añadido', 'action': 'added'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400
