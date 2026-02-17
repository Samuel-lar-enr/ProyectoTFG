from .usuarios.usuario_controller import usuario_bp
from .usuarios.rol_controller import rol_bp
from .usuarios.puesto_controller import puesto_bp
from .usuarios.usuario_rol_controller import usuario_rol_bp
from .area.area_controller import area_bp
from .eventos.evento_controller import evento_bp
from .eventos.reserva_evento_controller import reserva_evento_bp
from .eventos.evento_tag_controller import evento_tag_bp
from .oraciones.oracion_controller import oracion_bp
from .oraciones.oracion_recordatorio_controller import oracion_recordatorio_bp
from .oraciones.oracion_tag_controller import oracion_tag_bp
from .blog.blog_controller import blog_bp
from .blog.reaccion_controller import reaccion_bp
from .blog.reaccion_blog_controller import reaccion_blog_bp
from .blog.comentario_controller import comentario_bp
from .blog.blog_tag_controller import blog_tag_bp
from .comun.tag_controller import tag_bp
from .auth.auth_controller import auth_bp

def register_blueprints(app):
    app.register_blueprint(usuario_bp, url_prefix='/api/usuarios')
    app.register_blueprint(rol_bp, url_prefix='/api/roles')
    app.register_blueprint(puesto_bp, url_prefix='/api/puestos')
    app.register_blueprint(usuario_rol_bp, url_prefix='/api/usuario_rol')
    app.register_blueprint(area_bp, url_prefix='/api/areas')
    app.register_blueprint(evento_bp, url_prefix='/api/eventos')
    app.register_blueprint(reserva_evento_bp, url_prefix='/api/reservas')
    app.register_blueprint(evento_tag_bp, url_prefix='/api/evento_tag')
    app.register_blueprint(oracion_bp, url_prefix='/api/oraciones')
    app.register_blueprint(oracion_recordatorio_bp, url_prefix='/api/recordatorios')
    app.register_blueprint(oracion_tag_bp, url_prefix='/api/oracion_tag')
    app.register_blueprint(blog_bp, url_prefix='/api/blogs')
    app.register_blueprint(reaccion_bp, url_prefix='/api/reacciones')
    app.register_blueprint(reaccion_blog_bp, url_prefix='/api/reaccion_blog')
    app.register_blueprint(comentario_bp, url_prefix='/api/comentarios')
    app.register_blueprint(blog_tag_bp, url_prefix='/api/blog_tag')
    app.register_blueprint(tag_bp, url_prefix='/api/tags')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
