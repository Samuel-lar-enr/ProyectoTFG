from flask import Blueprint, request, jsonify
from models import db, Blog
from services.auth_service import check_permission

blog_bp = Blueprint('blog', __name__)

@blog_bp.route('/', methods=['GET'])
def get_blogs():
    blogs = Blog.query.all()
    return jsonify([b.to_dict() for b in blogs])


@blog_bp.route('/<int:id>', methods=['GET'])
def get_blog(id):
    blog = Blog.query.get_or_404(id)
    return jsonify(blog.to_dict())


@blog_bp.route('/', methods=['POST'])
def create_blog():
    data = request.get_json()
    user_id = data.get('id_user')
    
    if not check_permission(user_id):
        return jsonify({'status': 'error', 'message': 'No tienes permiso para crear este recurso para este usuario'}), 403
        
    try:
        new_blog = Blog(
            id_user=user_id,
            titulo=data['titulo'],
            contenido=data['contenido'],
            estado=data.get('estado', 1)
        )
        db.session.add(new_blog)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Post de blog creado', 'id': new_blog.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400

@blog_bp.route('/<int:id>', methods=['PUT', 'PATCH'])
def update_blog(id):
    blog = Blog.query.get_or_404(id)
    if not check_permission(blog.id_user):
        return jsonify({'status': 'error', 'message': 'No tienes permiso para editar este recurso'}), 403
    
    data = request.get_json()
    try:
        if 'titulo' in data:
            blog.titulo = data['titulo']
        if 'contenido' in data:
            blog.contenido = data['contenido']
        if 'estado' in data:
            blog.estado = data['estado']
        if 'id_user' in data:
            # check if they have permission to assign to the new user ID (usually admin only, but we assume permitted)
            if check_permission(data['id_user']):
                blog.id_user = data['id_user']
        
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Blog actualizado'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400


@blog_bp.route('/<int:id>', methods=['DELETE'])
def delete_blog(id):
    blog = Blog.query.get_or_404(id)
    
    if not check_permission(blog.id_user):
        return jsonify({'status': 'error', 'message': 'No tienes permiso para eliminar este recurso'}), 403
    
    try:
        db.session.delete(blog)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Blog eliminado'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400
