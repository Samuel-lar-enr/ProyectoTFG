from flask import Blueprint, request, jsonify
from models import db, ReaccionBlog
from services.auth_service import check_permission

reaccion_blog_bp = Blueprint('reaccion_blog', __name__)

@reaccion_blog_bp.route('/', methods=['POST'])
def create_reaccion_blog():
    data = request.get_json()
    try:
        new_rb = ReaccionBlog(
            id_user=data['id_user'],
            id_blog=data['id_blog'],
            id_reaccion=data['id_reaccion']
        )
        db.session.add(new_rb)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Reaccion anadida al post', 'id': new_rb.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400

@reaccion_blog_bp.route('/<int:id>', methods=['DELETE'])
def delete_reaccion_blog(id):
    reaccion_blog = ReaccionBlog.query.get_or_404(id)
    
    if not check_permission(reaccion_blog.id_user):
        return jsonify({'status': 'error', 'message': 'No tienes permiso para eliminar este recurso'}), 403
    
    try:
        db.session.delete(reaccion_blog)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Reaccion de blog eliminada'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400
