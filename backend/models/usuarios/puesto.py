from ..db import db

class Puesto(db.Model):
    __tablename__ = 'puesto'
    id = db.Column(db.Integer, primary_key=True)
    id_user = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    id_area = db.Column(db.Integer, db.ForeignKey('area.id'), nullable=False)
    id_rol = db.Column(db.Integer, db.ForeignKey('rol.id'), nullable=False)
    requiere_confirmacion = db.Column(db.Boolean, default=False)
    estado = db.Column(db.Integer, default=1)

    def __init__(self, id_user, id_area, id_rol, requiere_confirmacion=False, estado=1):
        self.id_user = id_user
        self.id_area = id_area
        self.id_rol = id_rol
        self.requiere_confirmacion = requiere_confirmacion
        self.estado = estado
        
    def to_dict(self):
        return {
            'id': self.id,
            'id_user': self.id_user,
            'id_area': self.id_area,
            'id_rol': self.id_rol,
            'requiere_confirmacion': self.requiere_confirmacion,
            'estado': self.estado
        }
