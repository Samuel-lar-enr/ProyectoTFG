from ..db import db

class EventoTag(db.Model):
    __tablename__ = 'evento_tag'
    id_evento = db.Column(db.Integer, db.ForeignKey('evento.id'), primary_key=True)
    id_tag = db.Column(db.Integer, db.ForeignKey('tag.id'), primary_key=True)

    def __init__(self, id_evento, id_tag):
        self.id_evento = id_evento
        self.id_tag = id_tag
