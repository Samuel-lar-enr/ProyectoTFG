from ..db import db

class Reaccion(db.Model):
    __tablename__ = 'reaccion'
    id = db.Column(db.Integer, primary_key=True)
    emoji = db.Column(db.String(10), nullable=False)

    def __init__(self, emoji):
        self.emoji = emoji
        
    def to_dict(self):
        return {
            'id': self.id,
            'emoji': self.emoji
        }
