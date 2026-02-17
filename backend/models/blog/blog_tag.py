from ..db import db

class BlogTag(db.Model):
    __tablename__ = 'blog_tag'
    id_blog = db.Column(db.Integer, db.ForeignKey('blog.id'), primary_key=True)
    id_tag = db.Column(db.Integer, db.ForeignKey('tag.id'), primary_key=True)

    def __init__(self, id_blog, id_tag):
        self.id_blog = id_blog
        self.id_tag = id_tag
