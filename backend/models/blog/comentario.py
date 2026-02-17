from datetime import datetime
from ..db import db

class Comentario(db.Model):
    __tablename__ = 'comentario'
    id = db.Column(db.Integer, primary_key=True)
    id_user = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    id_blog = db.Column(db.Integer, db.ForeignKey('blog.id'), nullable=False)
    contenido = db.Column(db.Text, nullable=False)
    imagen = db.Column(db.String(255), nullable=True)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, id_user, id_blog, contenido, imagen=None):
        self.id_user = id_user
        self.id_blog = id_blog
        self.contenido = contenido
        self.imagen = imagen
        
    def to_dict(self):
        return {
            'id': self.id,
            'id_user': self.id_user,
            'id_blog': self.id_blog,
            'contenido': self.contenido,
            'imagen': self.imagen,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None
        }
