from ..db import db

class OracionRecordatorio(db.Model):
    __tablename__ = 'oracion_recordatorio'
    id = db.Column(db.Integer, primary_key=True)
    id_user = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    id_oracion = db.Column(db.Integer, db.ForeignKey('oracion.id'), nullable=False)

    def __init__(self, id_user, id_oracion):
        self.id_user = id_user
        self.id_oracion = id_oracion
        
    def to_dict(self):
        return {
            'id': self.id,
            'id_user': self.id_user,
            'id_oracion': self.id_oracion
        }
