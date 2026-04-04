from flask import Blueprint, request, jsonify
from models import db, Comentario
from services.auth_service import check_permission

comentario_bp = Blueprint('comentario', __name__)

@comentario_bp.route('/', methods=['POST'])
def create_comentario():
    data = request.get_json()
    user_id = data.get('id_user')

    if not check_permission(user_id):
        return jsonify({'status': 'error', 'message': 'No tienes permiso para crear este recurso para este usuario'}), 403

    try:
        new_comentario = Comentario(
            id_user=user_id,
            id_blog=data['id_blog'],
            id_padre=data.get('id_padre'), # Soporte para respuestas
            contenido=data['contenido'],
            imagen=data.get('imagen')
        )
        db.session.add(new_comentario)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Comentario añadido', 'id': new_comentario.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400

@comentario_bp.route('/', methods=['GET'])
def get_comentarios():
    blog_id = request.args.get('blog_id')
    padre_id = request.args.get('padre_id')
    
    query = Comentario.query

    if blog_id:
        query = query.filter_by(id_blog=blog_id)
        
    if padre_id:
        if padre_id.lower() == 'none':
            query = query.filter_by(id_padre=None)
        else:
            query = query.filter_by(id_padre=padre_id)
    
    # Ordenar por fecha_creacion descendente por defecto
    comentarios = query.order_by(Comentario.fecha_creacion.desc()).all()
    
    return jsonify([c.to_dict() for c in comentarios])


@comentario_bp.route('/<int:id>', methods=['GET'])
def get_comentario(id):
    comentario = Comentario.query.get_or_404(id)
    return jsonify(comentario.to_dict())


@comentario_bp.route('/<int:id>', methods=['DELETE'])
def delete_comentario(id):
    comentario = Comentario.query.get_or_404(id)
    
    if not check_permission(comentario.id_user):
        return jsonify({'status': 'error', 'message': 'No tienes permiso para eliminar este recurso'}), 403
    
    try:
        # Soft delete: cambiar estado a 3 (eliminado)
        comentario.estado = 3
        # Opcional: comentario.contenido = "Este comentario ha sido eliminado"
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Comentario marcado como eliminado'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400
