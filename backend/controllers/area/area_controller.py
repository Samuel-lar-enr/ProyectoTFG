import os
import time
from werkzeug.utils import secure_filename
from flask import Blueprint, request, jsonify, current_app
from models import db, Area
from services.auth_service import check_permission

area_bp = Blueprint('area', __name__)

@area_bp.route('/', methods=['GET'])
def get_areas():
    areas = Area.query.all()
    return jsonify([a.to_dict() for a in areas])


@area_bp.route('/<int:id>', methods=['GET'])
def get_area(id):
    area = Area.query.get_or_404(id)
    return jsonify(area.to_dict())


@area_bp.route('/', methods=['POST'])
def create_area():
    data = request.form if request.form else request.get_json()
    imagen_url = data.get('imagen')
    
    if 'imagen_file' in request.files and request.files['imagen_file'].filename:
        file = request.files['imagen_file']
        filename = secure_filename(f"{int(time.time())}_{file.filename}")
        areas_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'areas')
        os.makedirs(areas_dir, exist_ok=True)
        file.save(os.path.join(areas_dir, filename))
        imagen_url = f"/uploads/areas/{filename}"
        
    try:
        new_area = Area(
            nombre=data.get('nombre'),
            descripcion=data.get('descripcion'),
            resumen=data.get('resumen'),
            imagen=imagen_url
        )
        db.session.add(new_area)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Area creada', 'id': new_area.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400

@area_bp.route('/<int:id>', methods=['PUT', 'PATCH'])
def update_area(id):
    area = Area.query.get_or_404(id)
    if not check_permission():
        return jsonify({'status': 'error', 'message': 'No tienes permiso para editar este recurso'}), 403
    
    data = request.form if request.form else request.get_json()
    try:
        if 'nombre' in data:
            area.nombre = data.get('nombre')
        if 'descripcion' in data:
            area.descripcion = data.get('descripcion')
        if 'resumen' in data:
            area.resumen = data.get('resumen')
            
        if 'imagen_file' in request.files and request.files['imagen_file'].filename:
            file = request.files['imagen_file']
            filename = secure_filename(f"{int(time.time())}_{file.filename}")
            areas_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'areas')
            os.makedirs(areas_dir, exist_ok=True)
            file.save(os.path.join(areas_dir, filename))
            area.imagen = f"/uploads/areas/{filename}"
        elif 'imagen' in data:
            area.imagen = data.get('imagen')
            
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Area actualizada'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400


@area_bp.route('/<int:id>', methods=['DELETE'])
def delete_area(id):
    area = Area.query.get_or_404(id)
    
    if not check_permission():
        return jsonify({'status': 'error', 'message': 'No tienes permiso para eliminar este recurso'}), 403
    
    try:
        db.session.delete(area)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Area eliminada'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400
