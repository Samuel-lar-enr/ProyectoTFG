from ..db import db

class UsuarioRol(db.Model):
    __tablename__ = 'usuario_rol'
    id = db.Column(db.Integer, primary_key=True)
    id_user = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    id_rol = db.Column(db.Integer, db.ForeignKey('rol.id'), nullable=False)

    def __init__(self, id_user, id_rol):
        self.id_user = id_user
        self.id_rol = id_rol
