from ..db import db

class ReaccionBlog(db.Model):
    __tablename__ = 'reaccion_blog'
    id = db.Column(db.Integer, primary_key=True)
    id_user = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    id_blog = db.Column(db.Integer, db.ForeignKey('blog.id'), nullable=False)
    id_reaccion = db.Column(db.Integer, db.ForeignKey('reaccion.id'), nullable=False)

    def __init__(self, id_user, id_blog, id_reaccion):
        self.id_user = id_user
        self.id_blog = id_blog
        self.id_reaccion = id_reaccion
