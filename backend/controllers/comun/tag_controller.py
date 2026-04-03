from flask import Blueprint, request, jsonify
from models import db, Tag
from services.auth_service import check_permission

tag_bp = Blueprint('tag', __name__)

@tag_bp.route('/', methods=['GET'])
def get_tags():
    tags = Tag.query.all()
    return jsonify([t.to_dict() for t in tags])


@tag_bp.route('/', methods=['POST'])
def create_tag():
    data = request.get_json()
    try:
        new_tag = Tag(
            nombre=data['nombre'],
            tipo=data['tipo']
        )
        db.session.add(new_tag)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Etiqueta creada', 'id': new_tag.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400

@tag_bp.route('/<int:id>', methods=['DELETE'])
def delete_tag(id):
    tag = Tag.query.get_or_404(id)
    # Only Admin/Pastor can delete Tags
    if not check_permission():
        return jsonify({'status': 'error', 'message': 'No tienes permiso para eliminar este recurso'}), 403
    
    try:
        db.session.delete(tag)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Etiqueta eliminada'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400

@tag_bp.route('/<int:id>', methods=['PUT', 'PATCH'])
def update_tag(id):
    tag = Tag.query.get_or_404(id)
    # Only Admin/Pastor can update Tags
    if not check_permission():
        return jsonify({'status': 'error', 'message': 'No tienes permiso para editar este recurso'}), 403
    
    data = request.get_json()
    try:
        if 'nombre' in data:
            tag.nombre = data['nombre']
        if 'tipo' in data:
            tag.tipo = data['tipo']
            
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Etiqueta actualizada'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400
