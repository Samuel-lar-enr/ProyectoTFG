from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from models import db, Usuario

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'status': 'error', 'message': 'Faltan datos obligatorios'}), 400

    if Usuario.query.filter_by(email=email).first():
        return jsonify({'status': 'error', 'message': 'El email ya esta registrado'}), 400
    
    if Usuario.query.filter_by(username=username).first():
        return jsonify({'status': 'error', 'message': 'El nombre de usuario ya existe'}), 400

    try:
        new_usuario = Usuario(
            username=username,
            email=email,
            password=password
        )
        db.session.add(new_usuario)
        db.session.commit()
        
        # Opcional: Login automático tras registro
        login_user(new_usuario)
        
        return jsonify({
            'status': 'success', 
            'message': 'Usuario registrado y logueado correctamente',
            'user': new_usuario.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    usuario = Usuario.query.filter_by(email=email).first()
    
    if usuario and usuario.check_password(password):
        login_user(usuario)
        return jsonify({
            'status': 'success', 
            'message': 'Login exitoso',
            'user': usuario.to_dict()
        }), 200
        
    return jsonify({'status': 'error', 'message': 'Credenciales invalidas'}), 401

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'status': 'success', 'message': 'Logout exitoso'}), 200

@auth_bp.route('/check', methods=['GET'])
def auth_check():
    if current_user.is_authenticated:
        return jsonify({
            'isAuthenticated': True,
            'user': current_user.to_dict()
        })
    return jsonify({'isAuthenticated': False}), 200
