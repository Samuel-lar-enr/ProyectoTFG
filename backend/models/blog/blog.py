from datetime import datetime
from ..db import db

class Blog(db.Model):
    __tablename__ = 'blog'
    id = db.Column(db.Integer, primary_key=True)
    id_user = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    titulo = db.Column(db.String(200), nullable=False)
    contenido = db.Column(db.Text, nullable=False)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    estado = db.Column(db.Integer, default=1)
    
    tags = db.relationship('Tag', secondary='blog_tag', backref='blogs')
    reacciones = db.relationship('ReaccionBlog', backref='blog')
    comentarios = db.relationship('Comentario', backref='blog', lazy=True)

    def __init__(self, id_user, titulo, contenido, estado=1):
        self.id_user = id_user
        self.titulo = titulo
        self.contenido = contenido
        self.estado = estado
        
    def to_dict(self):
        return {
            'id': self.id,
            'id_user': self.id_user,
            'titulo': self.titulo,
            'contenido': self.contenido,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            'estado': self.estado,
            'tags': [tag.nombre for tag in self.tags],
            'autor': self.autor.username if self.autor else None
        }
