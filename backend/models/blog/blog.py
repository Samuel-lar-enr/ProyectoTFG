from datetime import datetime
from ..db import db

class Blog(db.Model):
    __tablename__ = 'blog'
    id = db.Column(db.Integer, primary_key=True)
    id_user = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    titulo = db.Column(db.String(200), nullable=False)
    contenido = db.Column(db.Text, nullable=False)
    imagen = db.Column(db.String(500), nullable=True) # URL de imagen opcional
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    estado = db.Column(db.Integer, default=1)
    
    tags = db.relationship('Tag', secondary='blog_tag', backref='blogs')
    reacciones = db.relationship('ReaccionBlog', backref='blog')
    comentarios = db.relationship('Comentario', backref='blog', lazy=True)

    def __init__(self, id_user, titulo, contenido, imagen=None, estado=1):
        self.id_user = id_user
        self.titulo = titulo
        self.contenido = contenido
        self.imagen = imagen
        self.estado = estado
        
    def to_dict(self, current_user_id=None):
        # Agrupar reacciones por tipo
        stats_reacciones = {}
        user_reaccion_ids = []
        
        for rb in self.reacciones:
            emoji = rb.reaccion.emoji if rb.reaccion else '👍'
            if emoji not in stats_reacciones:
                stats_reacciones[emoji] = 0
            stats_reacciones[emoji] += 1
            
            if current_user_id and rb.id_user == current_user_id:
                user_reaccion_ids.append(rb.id_reaccion)

        return {
            'id': self.id,
            'id_user': self.id_user,
            'titulo': self.titulo,
            'contenido': self.contenido,
            'imagen': self.imagen,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            'estado': self.estado,
            'tags': [tag.nombre for tag in self.tags],
            'autor': self.autor.username if self.autor else 'Anónimo',
            'stats_reacciones': stats_reacciones,
            'user_reaccion_ids': user_reaccion_ids,
            'n_comentarios': len([c for c in self.comentarios if c.estado != 3]) # No contar eliminados
        }
