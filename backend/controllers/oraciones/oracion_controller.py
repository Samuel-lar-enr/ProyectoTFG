from flask import Blueprint, request, jsonify
from models import db, Oracion
from services.auth_service import check_permission, check_banned

oracion_bp = Blueprint('oracion', __name__)

@oracion_bp.route('/', methods=['GET'])
def get_oraciones():
    oraciones = Oracion.query.all()
    return jsonify([o.to_dict() for o in oraciones])


@oracion_bp.route('/<int:id>', methods=['GET'])
def get_oracion(id):
    oracion = Oracion.query.get_or_404(id)
    return jsonify(oracion.to_dict())


@oracion_bp.route('/', methods=['POST'])
def create_oracion():
    data = request.get_json()
    user_id = data.get('id_user')

    if check_banned():
        return jsonify({'status': 'error', 'message': 'Tu cuenta está suspendida. No puedes publicar oraciones'}), 403

    if not check_permission(user_id):
        return jsonify({'status': 'error', 'message': 'No tienes permiso para crear este recurso para este usuario'}), 403

    try:
        new_oracion = Oracion(
            id_user=user_id,
            titulo=data['titulo'],
            contenido=data['contenido'],
            duracion_dias=data.get('duracion_dias'),
            estado=data.get('estado', 1),
            anonima=data.get('anonima', False)
        )
        
        # Guardar Tags asociados
        tags_data = data.get('tags', [])
        if tags_data:
            from models import Tag
            tags = Tag.query.filter(Tag.nombre.in_(tags_data)).all()
            new_oracion.tags = tags

        db.session.add(new_oracion)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Peticion de oracion creada', 'id': new_oracion.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400

@oracion_bp.route('/<int:id>', methods=['PUT', 'PATCH'])
def update_oracion(id):
    oracion = Oracion.query.get_or_404(id)
    if not check_permission(oracion.id_user):
        return jsonify({'status': 'error', 'message': 'No tienes permiso para editar este recurso'}), 403
    
    data = request.get_json()
    try:
        if 'titulo' in data:
            oracion.titulo = data['titulo']
        if 'contenido' in data:
            oracion.contenido = data['contenido']
        if 'duracion_dias' in data:
            oracion.duracion_dias = data['duracion_dias']
        if 'estado' in data:
            oracion.estado = data['estado']
        if 'anonima' in data:
            oracion.anonima = data['anonima']
            
        # Handle Tags update
        if 'tags' in data:
            from models import Tag
            tags_names = data['tags']
            if isinstance(tags_names, list):
                new_tags = Tag.query.filter(Tag.nombre.in_(tags_names)).all()
                oracion.tags = new_tags
            
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Oracion actualizada'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400


@oracion_bp.route('/<int:id>', methods=['DELETE'])
def delete_oracion(id):
    oracion = Oracion.query.get_or_404(id)
    
    if not check_permission(oracion.id_user):
        return jsonify({'status': 'error', 'message': 'No tienes permiso para eliminar este recurso'}), 403
    
    try:
        db.session.delete(oracion)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Oracion eliminada'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400


@oracion_bp.route('/<int:id>/reanudar', methods=['POST'])
def reanudar_oracion(id):
    from datetime import datetime
    oracion = Oracion.query.get_or_404(id)

    if not check_permission(oracion.id_user):
        return jsonify({'status': 'error', 'message': 'No tienes permiso para reanudar esta oración'}), 403

    try:
        oracion.fecha_creacion = datetime.utcnow()
        oracion.estado = 1
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Oración reanudada correctamente', 'oracion': oracion.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400
