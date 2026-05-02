import os
import threading
from flask_mailman import EmailMessage
from flask import current_app

def send_email_task(app, msg, recipient):
    with app.app_context():
        try:
            print(f"DEBUG: Intentando enviar email a {recipient}...")
            msg.send()
            print(f"SUCCESS: Email enviado correctamente a {recipient}")
        except Exception as e:
            print(f"CRITICAL ERROR enviando email a {recipient}: {str(e)}")
            import traceback
            traceback.print_exc()

def send_email(subject, recipient, body, html=None, background=True):
    """
    Función genérica para enviar correos electrónicos con logging mejorado.
    """
    try:
        sender = current_app.config.get('MAIL_DEFAULT_SENDER')
        if not sender:
            print("ERROR: MAIL_DEFAULT_SENDER no está configurado. El email no se enviará.")
            return False

        print(f"DEBUG: Preparando email para {recipient} (Remitente: {sender})")
        
        msg = EmailMessage(
            subject,
            body,
            sender,
            [recipient]
        )
        if html:
            msg.content_subtype = "html"
            msg.body = html
        
        if background:
            # Enviar en un hilo separado para no bloquear la respuesta
            thread = threading.Thread(target=send_email_task, args=(current_app._get_current_object(), msg, recipient))
            thread.start()
            print(f"DEBUG: Hilo de envío de email iniciado para {recipient}")
            return True
        else:
            msg.send()
            print(f"SUCCESS: Email enviado (sincrónico) a {recipient}")
            return True
    except Exception as e:
        print(f"ERROR preparando email para {recipient}: {str(e)}")
        return False

def send_welcome_email(user_email, username):
    subject = "¡Bienvenido al Proyecto TFG Iglesia!"
    body = f"Hola {username}, gracias por registrarte en nuestra plataforma."
    html = f"<h1>¡Bienvenido, {username}!</h1><p>Gracias por registrarte en nuestra plataforma del Proyecto TFG Iglesia.</p>"
    return send_email(subject, user_email, body, html, background=True)

def send_password_reset_email(user_email, token):
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
    reset_url = f"{frontend_url}/reset-password?token={token}"
    
    subject = "Recuperación de contraseña - Iglesia TFG"
    body = f"Para restablecer tu contraseña, haz clic en el siguiente enlace: {reset_url}\nSi no solicitaste este cambio, ignora este correo."
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Recuperación de Contraseña</h2>
        <p>Hola,</p>
        <p>Has solicitado restablecer tu contraseña en el Proyecto TFG Iglesia. Haz clic en el siguiente botón para continuar con el proceso:</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{reset_url}}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Restablecer mi contraseña</a>
        </div>
        <p>Este enlace expirará en 1 hora. Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
        <p style="word-break: break-all; color: #007bff;"><a href="{{reset_url}}">{{reset_url}}</a></p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 0.8em; color: #777;">Si no has solicitado este cambio, por favor ignora este correo. Tu contraseña seguirá siendo la misma.</p>
    </div>
    """.replace("{{reset_url}}", reset_url)
    return send_email(subject, user_email, body, html, background=True)

