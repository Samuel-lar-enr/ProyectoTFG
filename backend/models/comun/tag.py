from ..db import db

class Tag(db.Model):
    __tablename__ = 'tag'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)
    tipo = db.Column(db.String(20)) # blog, oracion, evento

    def __init__(self, nombre, tipo):
        self.nombre = nombre
        self.tipo = tipo
        
    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'tipo': self.tipo
        }
