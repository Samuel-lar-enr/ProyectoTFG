from datetime import datetime
from ..db import db

class ReservaEvento(db.Model):
    __tablename__ = 'reserva_evento'
    id = db.Column(db.Integer, primary_key=True)
    id_user = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    id_evento = db.Column(db.Integer, db.ForeignKey('evento.id'), nullable=False)
    estado = db.Column(db.Integer, default=1)
    fecha_reserva = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, id_user, id_evento, estado=1):
        self.id_user = id_user
        self.id_evento = id_evento
        self.estado = estado
        
    def to_dict(self):
        return {
            'id': self.id,
            'id_user': self.id_user,
            'id_evento': self.id_evento,
            'estado': self.estado,
            'fecha_reserva': self.fecha_reserva.isoformat() if self.fecha_reserva else None
        }
