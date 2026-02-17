from ..db import db

class OracionTag(db.Model):
    __tablename__ = 'oracion_tag'
    id_oracion = db.Column(db.Integer, db.ForeignKey('oracion.id'), primary_key=True)
    id_tag = db.Column(db.Integer, db.ForeignKey('tag.id'), primary_key=True)

    def __init__(self, id_oracion, id_tag):
        self.id_oracion = id_oracion
        self.id_tag = id_tag
