from flask import Blueprint, request, jsonify
from models import db, UsuarioRol

usuario_rol_bp = Blueprint('usuario_rol', __name__)

@usuario_rol_bp.route('/', methods=['POST'])
def assign_rol():
    data = request.get_json()
    try:
        new_ur = UsuarioRol(
            id_user=data['id_user'],
            id_rol=data['id_rol']
        )
        db.session.add(new_ur)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Rol asignado correctamente'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400


@usuario_rol_bp.route('/<int:id>', methods=['DELETE'])
def delete_rol(id):
    usuario_rol = UsuarioRol.query.get_or_404(id)
    try:
        db.session.delete(usuario_rol)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Rol eliminado correctamente'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400

