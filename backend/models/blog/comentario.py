from datetime import datetime
from ..db import db

class Comentario(db.Model):
    __tablename__ = 'comentario'
    id = db.Column(db.Integer, primary_key=True)
    id_user = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    id_blog = db.Column(db.Integer, db.ForeignKey('blog.id'), nullable=False)
    id_padre = db.Column(db.Integer, db.ForeignKey('comentario.id'), nullable=True)
    
    contenido = db.Column(db.Text, nullable=False)
    imagen = db.Column(db.String(255), nullable=True)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_actualizacion = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    estado = db.Column(db.Integer, default=1) # 1: activo, 2: oculta, 3: eliminada

    respuestas = db.relationship('Comentario', 
                                 backref=db.backref('padre', remote_side=[id]),
                                 lazy='dynamic')
    
    autor = db.relationship('Usuario', backref='comentarios')

    def __init__(self, id_user, id_blog, contenido, id_padre=None, imagen=None, estado=1):
        self.id_user = id_user
        self.id_blog = id_blog
        self.id_padre = id_padre
        self.contenido = contenido
        self.imagen = imagen
        self.estado = estado
        
    def to_dict(self):
        return {
            'id': self.id,
            'id_user': self.id_user,
            'username': self.autor.username if self.autor else "Anónimo",
            'avatar': self.autor.avatar if self.autor else None,
            'id_blog': self.id_blog,
            'id_padre': self.id_padre,
            'contenido': self.contenido,
            'imagen': self.imagen,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            'fecha_actualizacion': self.fecha_actualizacion.isoformat() if self.fecha_actualizacion else None,
            'estado': self.estado,
            'n_respuestas': self.respuestas.count()
        }
