from ..db import db

class Evento(db.Model):
    __tablename__ = 'evento'
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text)
    fecha_inicio = db.Column(db.DateTime, nullable=False)
    fecha_fin = db.Column(db.DateTime)
    aforo_max = db.Column(db.Integer)
    estado = db.Column(db.Integer, default=1)
    id_area = db.Column(db.Integer, db.ForeignKey('area.id'), nullable=False)
    id_user = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=True) # Creator
    
    reservas = db.relationship('ReservaEvento', backref='evento')
    tags = db.relationship('Tag', secondary='evento_tag', backref='eventos')

    def __init__(self, titulo, descripcion, fecha_inicio, id_area, id_user=None, fecha_fin=None, aforo_max=None, estado=1):
        self.titulo = titulo
        self.descripcion = descripcion
        self.fecha_inicio = fecha_inicio
        self.id_area = id_area
        self.id_user = id_user
        self.fecha_fin = fecha_fin
        self.aforo_max = aforo_max
        self.estado = estado

    def to_dict(self):
        return {
            'id': self.id,
            'titulo': self.titulo,
            'descripcion': self.descripcion,
            'fecha_inicio': self.fecha_inicio.isoformat() if self.fecha_inicio else None,
            'fecha_fin': self.fecha_fin.isoformat() if self.fecha_fin else None,
            'aforo_max': self.aforo_max,
            'estado': self.estado,
            'id_area': self.id_area,
            'id_user': self.id_user,
            'tags': [tag.nombre for tag in self.tags],
            'total_reservas': len([r for r in self.reservas if r.estado == 1])
        }
