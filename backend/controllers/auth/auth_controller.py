import secrets
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, session
from flask_login import login_user, logout_user, login_required, current_user
from sqlalchemy import text
from models import db, Usuario
from services.email_service import send_welcome_email, send_password_reset_email

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    print(f"DEBUG: Incoming register request from {request.remote_addr}")
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    notificaciones = data.get('notificaciones', False)

    if not username or not email or not password:
        return jsonify({'status': 'error', 'message': 'Faltan datos obligatorios'}), 400

    # Comprobar si el email o username ya existen
    try:
        if Usuario.query.filter_by(email=email).first():
            return jsonify({'status': 'error', 'message': 'El email ya está registrado'}), 400
        
        if Usuario.query.filter_by(username=username).first():
            return jsonify({'status': 'error', 'message': 'El nombre de usuario ya existe'}), 400
    except Exception as e:
        print(f"DEBUG: Error on checks: {e}")
        return jsonify({'status': 'error', 'message': 'Error de base de datos'}), 500

    try:
        new_usuario = Usuario(
            username=username,
            email=email,
            password=password,
            notificaciones=notificaciones
        )
        db.session.add(new_usuario)
        db.session.commit()
        
        # Login automático tras registro
        session.permanent = True
        login_user(new_usuario, remember=True)
        
        # Obtener dict ligero para responder rápido
        user_data = new_usuario.to_dict_light()
        
        # Enviar email de bienvenida en segundo plano
        try:
            send_welcome_email(email, username)
        except Exception as e:
            print(f"Error al iniciar envío de email: {e}")
        
        return jsonify({
            'status': 'success', 
            'message': 'Usuario registrado y logueado correctamente',
            'user': user_data
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"DEBUG: Error during registration: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    from sqlalchemy import text
    try:
        # Buscar usuario por email con SQL puro para evitar el bug de aliasing
        row = db.session.execute(
            text("SELECT id FROM usuario WHERE email = :email"),
            {"email": email}
        ).fetchone()
        
        usuario = Usuario.query.get(row[0]) if row else None
    except Exception as e:
        print(f"DEBUG: SQL Error on login: {e}")
        return jsonify({'status': 'error', 'message': 'Error al conectar con la base de datos'}), 500
    
    if usuario and usuario.check_password(password):
        from flask import session
        session.permanent = True
        login_user(usuario, remember=True)
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

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({'status': 'error', 'message': 'El email es obligatorio'}), 400
        
    usuario = db.session.query(Usuario).filter_by(email=email).first()
    
    if usuario:
        token = secrets.token_urlsafe(32)
        usuario.reset_token = token
        usuario.reset_expiration = datetime.utcnow() + timedelta(hours=1)
        db.session.commit()
        
        send_password_reset_email(usuario.email, token)
        
    return jsonify({
        'status': 'success', 
        'message': 'Si el email está registrado, se ha enviado un enlace de recuperación.'
    }), 200

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('password')
    
    if not token or not new_password:
        return jsonify({'status': 'error', 'message': 'Token y nueva contraseña son obligatorios'}), 400
        
    usuario = db.session.query(Usuario).filter_by(reset_token=token).first()
    
    if not usuario or (usuario.reset_expiration and usuario.reset_expiration < datetime.utcnow()):
        return jsonify({'status': 'error', 'message': 'Token inválido o expirado'}), 400
        
    try:
        usuario.set_password(new_password)
        usuario.reset_token = None
        usuario.reset_expiration = None
        db.session.commit()
        
        return jsonify({'status': 'success', 'message': 'Contraseña actualizada correctamente'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400

