from datetime import datetime
from ..db import db

class Oracion(db.Model):
    __tablename__ = 'oracion'
    id = db.Column(db.Integer, primary_key=True)
    id_user = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    titulo = db.Column(db.String(200), nullable=False)
    contenido = db.Column(db.Text, nullable=False)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    duracion_dias = db.Column(db.Integer)
    estado = db.Column(db.Integer, default=1)
    
    recordatorios = db.relationship('OracionRecordatorio', backref='oracion')
    tags = db.relationship('Tag', secondary='oracion_tag', backref='oraciones')

    def __init__(self, id_user, titulo, contenido, duracion_dias=None, estado=1):
        self.id_user = id_user
        self.titulo = titulo
        self.contenido = contenido
        self.duracion_dias = duracion_dias
        self.estado = estado

    def to_dict(self):
        return {
            'id': self.id,
            'id_user': self.id_user,
            'titulo': self.titulo,
            'contenido': self.contenido,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            'duracion_dias': self.duracion_dias,
            'estado': self.estado,
            'tags': [tag.nombre for tag in self.tags],
            'autor': self.usuario.username if self.usuario else None
        }
