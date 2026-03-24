from flask import Blueprint, request, jsonify
from models import db, BlogTag, Blog
from services.auth_service import check_permission

blog_tag_bp = Blueprint('blog_tag', __name__)

@blog_tag_bp.route('/', methods=['POST'])
def add_tag_to_blog():
    data = request.get_json()
    try:
        new_bt = BlogTag(
            id_blog=data['id_blog'],
            id_tag=data['id_tag']
        )
        db.session.add(new_bt)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Etiqueta anadida al post del blog'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400

@blog_tag_bp.route('/<int:id_blog>/<int:id_tag>', methods=['DELETE'])
def remove_tag_from_blog(id_blog, id_tag):
    blog = Blog.query.get_or_404(id_blog)
    
    if not check_permission(blog.id_user):
        return jsonify({'status': 'error', 'message': 'No tienes permiso para eliminar esta etiqueta'}), 403
        
    bt = BlogTag.query.filter_by(id_blog=id_blog, id_tag=id_tag).first_or_404()
    try:
        db.session.delete(bt)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Etiqueta eliminada del post'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400
