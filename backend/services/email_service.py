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
