from ..db import db

class Area(db.Model):
    __tablename__ = 'area'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    resumen = db.Column(db.Text)
    imagen = db.Column(db.String(255))
    
    eventos = db.relationship('Evento', backref='area')
    puestos = db.relationship('Puesto', backref='area')

    def __init__(self, nombre, descripcion=None, resumen=None, imagen=None):
        self.nombre = nombre
        self.descripcion = descripcion
        self.resumen = resumen
        self.imagen = imagen
        
    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'resumen': self.resumen,
            'imagen': self.imagen,
            'usuarios': [{
                'id': p.usuario.id,
                'username': p.usuario.username,
                'avatar': p.usuario.avatar
            } for p in getattr(self, 'puestos', []) if p.estado == 1 and p.usuario]
        }
