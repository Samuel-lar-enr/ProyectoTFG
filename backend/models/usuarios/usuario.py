from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from ..db import db

class Usuario(db.Model, UserMixin):
    __tablename__ = 'usuario'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    estado = db.Column(db.Integer, default=1)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    avatar = db.Column(db.String(255))
    notificaciones = db.Column(db.Boolean, default=False)
    reset_token = db.Column(db.String(100), unique=True, nullable=True)
    reset_expiration = db.Column(db.DateTime, nullable=True)

    
    # Relationships
    roles = db.relationship('Rol', secondary='usuario_rol', backref='usuarios')
    puestos = db.relationship('Puesto', backref='usuario')
    reservas = db.relationship('ReservaEvento', backref='usuario')
    oraciones = db.relationship('Oracion', backref='usuario')
    recordatorios = db.relationship('OracionRecordatorio', backref='usuario')
    blogs = db.relationship('Blog', backref='autor')
    reacciones = db.relationship('ReaccionBlog', backref='usuario')

    def __init__(self, username, email, password=None, estado=1, avatar=None, notificaciones=False):
        self.username = username
        self.email = email
        if password:
            self.set_password(password)
        self.estado = estado
        self.avatar = avatar
        self.notificaciones = notificaciones

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'estado': self.estado,
            'avatar': self.avatar,
            'notificaciones': self.notificaciones,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            'roles': [role.nombre for role in self.roles]
        }

    #funciones

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    #Coger roles en formato lista
    def get_roles(self):
        return [role.nombre for role in self.roles]
    
    def get_puestos(self):
        return [puesto.id for puesto in self.puestos]

    def get_areas(self):
        return [puesto.area.nombre for puesto in self.puestos if puesto.area]

    def get_reservas(self):
        return [reserva.evento.titulo for reserva in self.reservas]

    def get_oraciones(self):
        return [oracion.titulo for oracion in self.oraciones]

    def get_recordatorios(self):
        return [recordatorio.oracion.titulo for recordatorio in self.recordatorios]

    def get_blogs(self):
        return [blog.titulo for blog in self.blogs]

    def get_reacciones(self):
        return [reaccion.blog.titulo for reaccion in self.reacciones]
