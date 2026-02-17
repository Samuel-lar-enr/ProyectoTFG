from flask import Blueprint, request, jsonify
from models import db, Reaccion
from services.auth_service import check_permission

reaccion_bp = Blueprint('reaccion', __name__)

@reaccion_bp.route('/', methods=['GET'])
def get_reacciones():
    reacciones = Reaccion.query.all()
    return jsonify([r.to_dict() for r in reacciones])


@reaccion_bp.route('/', methods=['POST'])
def create_reaccion():
    data = request.get_json()
    try:
        new_reaccion = Reaccion(emoji=data['emoji'])
        db.session.add(new_reaccion)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Reaccion creada', 'id': new_reaccion.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400

@reaccion_bp.route('/<int:id>', methods=['DELETE'])
def delete_reaccion(id):
    reaccion = Reaccion.query.get_or_404(id)
    
    if not check_permission():
        return jsonify({'status': 'error', 'message': 'No tienes permiso para eliminar este recurso'}), 403
    
    try:
        db.session.delete(reaccion)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Reaccion eliminada'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400
