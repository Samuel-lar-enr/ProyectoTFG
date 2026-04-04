from flask import Blueprint, request, jsonify
from models import db, ReaccionBlog
from services.auth_service import check_permission

reaccion_blog_bp = Blueprint('reaccion_blog', __name__)

@reaccion_blog_bp.route('/', methods=['GET'])
def get_reacciones_blog():
    reacciones = ReaccionBlog.query.all()
    result = []
    from models import Usuario, Reaccion
    for rb in reacciones:
        user = Usuario.query.get(rb.id_user)
        reac = Reaccion.query.get(rb.id_reaccion)
        result.append({
            'id': rb.id,
            'id_user': rb.id_user,
            'username': user.username if user else 'Unknown',
            'id_blog': rb.id_blog,
            'id_reaccion': rb.id_reaccion,
            'tipo': reac.emoji if reac else '👍'
        })
    return jsonify(result)

@reaccion_blog_bp.route('/', methods=['POST'])
def create_reaccion_blog():
    data = request.get_json()
    user_id = data.get('id_user')
    id_blog = data.get('id_blog')
    id_reaccion = data.get('id_reaccion')

    if not check_permission(user_id):
        return jsonify({'status': 'error', 'message': 'No tienes permiso'}), 403

    # Check if reaction already exists (Toggle logic)
    existing = ReaccionBlog.query.filter_by(
        id_user=user_id,
        id_blog=id_blog,
        id_reaccion=id_reaccion
    ).first()

    try:
        if existing:
            db.session.delete(existing)
            db.session.commit()
            return jsonify({'status': 'success', 'message': 'Reacción eliminada', 'action': 'removed'}), 200
        else:
            new_rb = ReaccionBlog(
                id_user=user_id,
                id_blog=id_blog,
                id_reaccion=id_reaccion
            )
            db.session.add(new_rb)
            db.session.commit()
            return jsonify({'status': 'success', 'message': 'Reacción añadida', 'id': new_rb.id, 'action': 'added'}), 201
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
