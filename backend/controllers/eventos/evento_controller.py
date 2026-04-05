from flask import Blueprint, request, jsonify
from models import db, Evento
from datetime import datetime
from services.auth_service import check_permission, check_banned, has_area_permission, needs_event_confirmation

evento_bp = Blueprint('evento', __name__)

@evento_bp.route('/', methods=['GET'])
def get_eventos():
    from flask_login import current_user
    
    if not current_user.is_authenticated:
        # Public users only see confirmed
        eventos = Evento.query.filter_by(estado=1).all()
        return jsonify([e.to_dict() for e in eventos])

    role_ids = [rol.id for rol in current_user.roles]
    if 1 in role_ids or 2 in role_ids:
        # Admins/Pastors see EVERYTHING
        eventos = Evento.query.all()
    else:
        # Members see:
        # 1. All confirmed (1)
        # 2. Pending (2) ONLY IF they belong to that area
        user_area_ids = [p.id_area for p in current_user.puestos if p.estado == 1]
        eventos = Evento.query.filter(
            (Evento.estado == 1) | 
            ((Evento.estado == 2) & (Evento.id_area.in_(user_area_ids)) if user_area_ids else False)
        ).all()
        
    return jsonify([e.to_dict() for e in eventos])


@evento_bp.route('/<int:id>', methods=['GET'])
def get_evento(id):
    evento = Evento.query.get_or_404(id)
    return jsonify(evento.to_dict())


@evento_bp.route('/', methods=['POST'])
def create_evento():
    data = request.get_json()
    user_id = data.get('id_user')
    id_area = data.get('id_area')
    
    if check_banned():
        return jsonify({'status': 'error', 'message': 'Tu cuenta está suspendida'}), 403

    # New logic: Must be admin/pastor OR have a Puesto in THAT area
    if not has_area_permission(id_area):
        return jsonify({'status': 'error', 'message': f'No tienes permiso para crear eventos en esta área'}), 403
    
    # Ownership check (if they are trying to create an event for someone else, they must be admin)
    if not check_permission(user_id):
        return jsonify({'status': 'error', 'message': 'No puedes crear eventos para otro usuario'}), 403
        
    # Check if needs confirmation
    initial_status = 1
    if needs_event_confirmation(id_area):
        initial_status = 2 # Pendiente de aprobación

    try:
        new_evento = Evento(
            titulo=data['titulo'],
            descripcion=data.get('descripcion'),
            fecha_inicio=datetime.fromisoformat(data['fecha_inicio']),
            id_area=data['id_area'],
            id_user=user_id,
            fecha_fin=datetime.fromisoformat(data['fecha_fin']) if data.get('fecha_fin') else None,
            aforo_max=data.get('aforo_max'),
            estado=initial_status
        )
        db.session.add(new_evento)
        db.session.commit()
        
        msg = 'Evento agendado. Esperando confirmación de un superior.' if initial_status == 2 else 'Evento creado'
        return jsonify({'status': 'success', 'message': msg, 'id': new_evento.id, 'pending': initial_status == 2}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400

@evento_bp.route('/<int:id>', methods=['PUT', 'PATCH'])
def update_evento(id):
    evento = Evento.query.get_or_404(id)
    data = request.get_json()
    
    # Check general permission (owner or admin)
    if not check_permission(evento.id_user):
        return jsonify({'status': 'error', 'message': 'No tienes permiso para editar este recurso'}), 403
    
    # Area-specific permission: if they are changing the area, or if they are NOT admin
    # they must have permission for the area this event belongs to.
    target_area = data.get('id_area', evento.id_area)
    if not has_area_permission(target_area):
        return jsonify({'status': 'error', 'message': 'No tienes permiso para gestionar eventos en esta área'}), 403
    try:
        if 'titulo' in data:
            evento.titulo = data['titulo']
        if 'descripcion' in data:
            evento.descripcion = data['descripcion']
        if 'fecha_inicio' in data:
            evento.fecha_inicio = datetime.fromisoformat(data['fecha_inicio'])
        if 'fecha_fin' in data:
            evento.fecha_fin = datetime.fromisoformat(data['fecha_fin'])
        if 'id_area' in data:
            evento.id_area = data['id_area']
        if 'aforo_max' in data:
            evento.aforo_max = data['aforo_max']
        if 'estado' in data:
            evento.estado = data['estado']
            
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Evento actualizado'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400


@evento_bp.route('/<int:id>/confirmar', methods=['PATCH'])
def confirmar_evento(id):
    if not check_permission(): # Only admins/pastors
        return jsonify({'status': 'error', 'message': 'No tienes permiso para confirmar actividades'}), 403
        
    evento = Evento.query.get_or_404(id)
    evento.estado = 1 # Confirmado
    
    try:
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Actividad confirmada y publicada'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400


@evento_bp.route('/<int:id>', methods=['DELETE'])
def delete_evento(id):
    evento = Evento.query.get_or_404(id)
    
    if not check_permission(evento.id_user):
        return jsonify({'status': 'error', 'message': 'No tienes permiso para eliminar este recurso'}), 403
    
    try:
        db.session.delete(evento)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Evento eliminado'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400
