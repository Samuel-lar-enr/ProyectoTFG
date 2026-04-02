from main import app
from models import db
from sqlalchemy import text
from datetime import datetime, timedelta

with app.app_context():
    try:
        # Get admin user ID
        admin_res = db.session.execute(text("SELECT id FROM usuario WHERE username = 'admin'")).fetchone()
        if not admin_res:
            print("No admin user found. Run create_admin.py first.")
            exit(1)
        admin_id = admin_res[0]

        print("Creando datos con SQL puro...")
        
        # Tags
        db.session.execute(text("INSERT INTO tag (nombre) VALUES ('Estudio Bíblico')"), {})
        db.session.execute(text("INSERT INTO tag (nombre) VALUES ('Jóvenes')"), {})
        db.session.execute(text("INSERT INTO tag (nombre) VALUES ('Salud')"), {})

        # Blogs
        db.session.execute(text("INSERT INTO blog (id_user, titulo, contenido, estado) VALUES (:user, 'El poder de la fe', 'Contenido del blog...', 1)"), {"user": admin_id})
        blog_id = db.session.execute(text("SELECT LAST_INSERT_ID()")).scalar()

        # Comentarios
        db.session.execute(text("INSERT INTO comentario (id_user, id_blog, contenido, estado) VALUES (:user, :blog, '¡Excelente mensaje!', 1)"), {"user": admin_id, "blog": blog_id})

        # Reacciones
        db.session.execute(text("INSERT INTO reaccion (tipo, icono, estado) VALUES ('like', '👍', 1)"), {})
        reaccion_id = db.session.execute(text("SELECT LAST_INSERT_ID()")).scalar()
        db.session.execute(text("INSERT INTO reaccion_blog (id_user, id_blog, id_reaccion) VALUES (:user, :blog, :reaccion)"), {"user": admin_id, "blog": blog_id, "reaccion": reaccion_id})

        # Oraciones
        db.session.execute(text("INSERT INTO oracion (id_user, titulo, contenido, estado) VALUES (:user, 'Sanidad para mi familia', 'Oramos por la sanidad.', 1)"), {"user": admin_id})

        # Eventos
        later = datetime.now() + timedelta(days=10)
        db.session.execute(text("INSERT INTO evento (titulo, descripcion, fecha, ubicacion, capacidad) VALUES ('Culto de Alabanza', 'Culto especial', :fecha, 'Iglesia Principal', 200)"), {"fecha": later})

        db.session.commit()
        print("¡Base de datos poblada con éxito mediante SQL directo!")

    except Exception as e:
        db.session.rollback()
        print(f"Error insertando datos: {e}")
