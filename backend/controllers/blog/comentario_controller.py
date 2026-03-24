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
            contenido=data['contenido'],
            imagen=data.get('imagen')
        )
        db.session.add(new_comentario)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Comentario anadido', 'id': new_comentario.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400

@comentario_bp.route('/', methods=['GET'])
def get_comentarios():
    blog_id = request.args.get('blog_id')
    if blog_id:
        comentarios = Comentario.query.filter_by(id_blog=blog_id).all()
    else:
        comentarios = Comentario.query.all()
    
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
        db.session.delete(comentario)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Comentario eliminado'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400
