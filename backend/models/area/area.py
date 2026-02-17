from ..db import db

class Area(db.Model):
    __tablename__ = 'area'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    
    eventos = db.relationship('Evento', backref='area')
    puestos = db.relationship('Puesto', backref='area')

    def __init__(self, nombre, descripcion=None):
        self.nombre = nombre
        self.descripcion = descripcion
        
    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'descripcion': self.descripcion
        }
