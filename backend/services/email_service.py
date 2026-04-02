import os
from flask_mailman import EmailMessage
from flask import current_app

def send_email(subject, recipient, body, html=None):
    """
    Función genérica para enviar correos electrónicos.
    """
    try:
        msg = EmailMessage(
            subject,
            body,
            current_app.config['MAIL_DEFAULT_SENDER'],
            [recipient]
        )
        if html:
            msg.content_subtype = "html"
            msg.body = html
        
        msg.send()
        return True
    except Exception as e:
        print(f"Error enviando email: {str(e)}")
        return False

def send_welcome_email(user_email, username):
    subject = "¡Bienvenido al Proyecto TFG Iglesia!"
    body = f"Hola {username}, gracias por registrarte en nuestra plataforma."
    html = f"<h1>¡Bienvenido, {username}!</h1><p>Gracias por registrarte en nuestra plataforma del Proyecto TFG Iglesia.</p>"
    return send_email(subject, user_email, body, html)

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
    return send_email(subject, user_email, body, html)

