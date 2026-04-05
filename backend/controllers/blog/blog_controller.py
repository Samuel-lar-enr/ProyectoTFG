from flask import Blueprint, request, jsonify
from models import db, Blog
from services.auth_service import check_permission, check_banned

blog_bp = Blueprint('blog', __name__)

@blog_bp.route('/', methods=['GET'])
def get_blogs():
    from flask_login import current_user
    user_id = current_user.id if current_user.is_authenticated else None
    
    blogs = Blog.query.all()
    return jsonify([b.to_dict(current_user_id=user_id) for b in blogs])


@blog_bp.route('/<int:id>', methods=['GET'])
def get_blog(id):
    from flask_login import current_user
    user_id = current_user.id if current_user.is_authenticated else None
    
    blog = Blog.query.get_or_404(id)
    return jsonify(blog.to_dict(current_user_id=user_id))


@blog_bp.route('/', methods=['POST'])
def create_blog():
    data = request.get_json()
    user_id = data.get('id_user')
    
    if check_banned():
        return jsonify({'status': 'error', 'message': 'Tu cuenta está suspendida. No puedes publicar contenido'}), 403

    if not check_permission(user_id):
        return jsonify({'status': 'error', 'message': 'No tienes permiso para crear este recurso para este usuario'}), 403
        
    try:
        new_blog = Blog(
            id_user=user_id,
            titulo=data['titulo'],
            contenido=data['contenido'],
            imagen=data.get('imagen'),
            estado=data.get('estado', 1)
        )
        
        if 'tags' in data:
            from models import Tag
            tags = Tag.query.filter(Tag.nombre.in_(data['tags'])).all()
            new_blog.tags = tags
            
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
        if 'imagen' in data:
            blog.imagen = data['imagen']
        if 'estado' in data:
            blog.estado = data['estado']
        if 'id_user' in data:
            blog.id_user = data['id_user']
        if 'tags' in data:
            from models import Tag
            tags = Tag.query.filter(Tag.nombre.in_(data['tags'])).all()
            blog.tags = tags
        
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
