import os
import time
from dotenv import load_dotenv
from flask import Flask, jsonify, request, url_for
from flask_cors import CORS
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_mailman import Mail
from models import db, Usuario
from controllers import register_blueprints
from flask_apscheduler import APScheduler
from datetime import datetime, timedelta

# Cargar variables de entorno desde el .env de la raíz
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

app = Flask(__name__)
# Permitir tanto localhost como 127.0.0.1 para evitar bloqueos de CORS en Chrome/Edge
CORS(app, supports_credentials=True, origins=[
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174'
])

# Configuración de la base de datos (Prioriza variable de entorno DB_URL)
db_url = os.getenv('DB_URL', 'mysql+pymysql://admin:admin123@localhost:3306/iglesia_db')
print(f"DEBUG: Using DB_URL: {db_url}")
app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    "pool_recycle": 280,
    "pool_pre_ping": True,
}
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')

# Configuración de Email
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

# Inicializar DB y Migraciones
db.init_app(app)
migrate = Migrate(app, db)
mail = Mail(app)

# Scheduler para limpieza automática
scheduler = APScheduler()
scheduler.init_app(app)
scheduler.start()

def clean_expired_oraciones():
    with app.app_context():
        print(f"[{datetime.now()}] Ejecutando limpieza de oraciones caducadas...")
        from models import Oracion, OracionRecordatorio
        # Seleccionar oraciones activas con duración definida
        active_prayers = Oracion.query.filter(Oracion.estado == 1, Oracion.duracion_dias != None).all()
        count = 0
        for prayer in active_prayers:
            expiration_date = prayer.fecha_creacion + timedelta(days=prayer.duracion_dias)
            if datetime.utcnow() > expiration_date:
                prayer.estado = 0
                # Eliminar recordatorios asociados si la oración deja de estar activa
                OracionRecordatorio.query.filter_by(id_oracion=prayer.id).delete()
                count += 1
        
        if count > 0:
            db.session.commit()
            print(f"Se han desactivado {count} oraciones caducadas y limpiado sus recordatorios.")
        else:
            print("No se encontraron oraciones caducadas.")

def daily_prayer_notifications():
    with app.app_context():
        print(f"[{datetime.now()}] Iniciando envío de notificaciones de oración...")
        from models import Usuario, OracionRecordatorio, Oracion
        from flask_mailman import EmailMessage

        # Buscamos todos los usuarios que tengan al menos un recordatorio
        users_with_reminders = Usuario.query.join(OracionRecordatorio).all()
        
        for user in users_with_reminders:
            # Obtener oraciones recordadas por este usuario (que sigan activas)
            reminder_prayers = db.session.query(Oracion).join(OracionRecordatorio).filter(
                OracionRecordatorio.id_user == user.id,
                Oracion.estado == 1
            ).all()

            if not reminder_prayers:
                continue

            # Crear contenido del email
            body = f"Hola {user.username},\n\nAquí tienes las peticiones por las que te comprometiste a orar hoy:\n\n"
            for p in reminder_prayers:
                body += f"🙏 {p.titulo}\n   Mensaje: {p.contenido}\n   Autor: {'Anónimo' if p.anonima else p.usuario.username}\n\n"
            
            body += "\nQue Dios te bendiga,\nTu Iglesia Online"

            try:
                msg = EmailMessage(
                    "📅 Recordatorio: Tus oraciones para hoy",
                    body,
                    os.getenv('MAIL_DEFAULT_SENDER'),
                    [user.email]
                )
                msg.send()
                print(f"Email enviado a {user.email}")
            except Exception as e:
                print(f"Error enviando email a {user.email}: {e}")

# Ejecutar cada 12 horas la limpieza
scheduler.add_job(id='clean_prayers', func=clean_expired_oraciones, trigger='interval', hours=12)

# Ejecutar notificación diaria (ej: cada 24 horas)
scheduler.add_job(id='daily_notifications', func=daily_prayer_notifications, trigger='interval', hours=24)

# Login Manager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'auth.login'

@login_manager.user_loader
def load_user(user_id):
    return Usuario.query.get(int(user_id))

# Registrar rutas de la API
register_blueprints(app)

from flask_cors import cross_origin

@app.errorhandler(500)
@cross_origin(supports_credentials=True, origins=['http://localhost:5174', 'http://127.0.0.1:5174', 'http://localhost:5173', 'http://127.0.0.1:5173'])
def handle_500(e):
    return jsonify({
        'status': 'error',
        'message': 'Internal Server Error (DB Issue)',
        'error': str(e)
    }), 500

@app.route('/')
def index():
    return jsonify({
        "status": "success",
        "message": "Church TFG API is running",
        "version": "1.0.0"
    })

@app.route('/api')
def api_index():
    def get_service_info(blueprint_name, endpoint_list, base_url):
        services = {}
        for endpoint, method, path in endpoint_list:
            services[method] = f"{base_url}{path}"
        return {
            "enlace": base_url,
            "servicios": services
        }

    host = request.host_url.rstrip('/')
    
    # Discovery Map
    api_map = {
        "usuarios": get_service_info("usuario", [
            ("get_all", "GET", "/"),
            ("get_by_id", "GET", "/<id>"),
            ("create", "POST", "/"),
            ("update", "PUT/PATCH", "/<id>"),
            ("delete", "DELETE", "/<id>")
        ], f"{host}/api/usuarios"),
        
        "blogs": get_service_info("blog", [
            ("get_all", "GET", "/"),
            ("get_by_id", "GET", "/<id>"),
            ("create", "POST", "/"),
            ("update", "PUT/PATCH", "/<id>"),
            ("delete", "DELETE", "/<id>")
        ], f"{host}/api/blogs"),
        
        "eventos": get_service_info("evento", [
            ("get_all", "GET", "/"),
            ("get_by_id", "GET", "/<id>"),
            ("create", "POST", "/"),
            ("update", "PUT/PATCH", "/<id>"),
            ("delete", "DELETE", "/<id>")
        ], f"{host}/api/eventos"),
        
        "oraciones": get_service_info("oracion", [
            ("get_all", "GET", "/"),
            ("get_by_id", "GET", "/<id>"),
            ("create", "POST", "/"),
            ("update", "PUT/PATCH", "/<id>"),
            ("delete", "DELETE", "/<id>")
        ], f"{host}/api/oraciones"),
        
        "areas": get_service_info("area", [
            ("get_all", "GET", "/"),
            ("get_by_id", "GET", "/<id>"),
            ("create", "POST", "/"),
            ("update", "PUT/PATCH", "/<id>"),
            ("delete", "DELETE", "/<id>")
        ], f"{host}/api/areas"),
        
        "roles": get_service_info("rol", [
            ("get_all", "GET", "/"),
            ("get_by_id", "GET", "/<id>"),
            ("create", "POST", "/"),
            ("update", "PUT/PATCH", "/<id>"),
            ("delete", "DELETE", "/<id>")
        ], f"{host}/api/roles"),
        
        "puestos": get_service_info("puesto", [
            ("get_all", "GET", "/"),
            ("get_by_id", "GET", "/<id>"),
            ("create", "POST", "/"),
            ("update", "PUT/PATCH", "/<id>"),
            ("delete", "DELETE", "/<id>")
        ], f"{host}/api/puestos"),
        
        "reservas": get_service_info("reserva_evento", [
            ("get_all", "GET", "/"),
            ("get_by_id", "GET", "/<id>"),
            ("create", "POST", "/"),
            ("update", "PUT/PATCH", "/<id>"),
            ("delete", "DELETE", "/<id>")
        ], f"{host}/api/reservas"),

        "comentarios": get_service_info("comentario", [
            ("get_all", "GET", "/"),
            ("get_by_id", "GET", "/<id>"),
            ("create", "POST", "/"),
            ("delete", "DELETE", "/<id>")
        ], f"{host}/api/comentarios"),
        
        "auth": {
            "enlace": f"{host}/api/auth",
            "servicios": {
                "register": f"{host}/api/auth/register",
                "login": f"{host}/api/auth/login",
                "logout": f"{host}/api/auth/logout",
                "check": f"{host}/api/auth/check"
            }
        },
        
        "tags": {
            "enlace": f"{host}/api/tags",
            "servicios": {
                "get_all": f"{host}/api/tags/",
                "create": f"{host}/api/tags/"
            }
        }
    }

    return jsonify(api_map)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'success', 'message': 'API is running'}), 200

if __name__ == '__main__':
    # Reintentos para crear las tablas al iniciar (útil para Docker)
    with app.app_context():
        retries = 10
        success = False
        while retries > 0 and not success:
            try:
                db.create_all()
                print("Base de datos conectada e inicializada correctamente.")
                success = True
            except Exception as e:
                retries -= 1
                print(f"Esperando a la base de datos... ({retries} reintentos restantes)")
                time.sleep(5)
        
        if not success:
            print("Error crítico: No se ha podido conectar con la base de datos tras varios intentos.")
    
    app.run(debug=True, port=5000, host='0.0.0.0')


