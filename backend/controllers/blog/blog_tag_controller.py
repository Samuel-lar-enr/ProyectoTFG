from flask import Blueprint, request, jsonify
from models import db, BlogTag

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
