import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_image(file, folder='blogs'):
    print(f"DEBUG: save_image called. File: {file}, Folder: {folder}")
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        print(f"DEBUG: secure_filename: {filename}")
        # Generar un nombre único para evitar colisiones
        unique_filename = f"{uuid.uuid4()}_{filename}"
        
        # Guardar en la carpeta correspondiente
        relative_path = os.path.join(folder, unique_filename)
        absolute_path = os.path.join(current_app.config['UPLOAD_FOLDER'], relative_path)
        print(f"DEBUG: Saving to absolute_path: {absolute_path}")
        
        # Asegurar que el subdirectorio existe
        os.makedirs(os.path.dirname(absolute_path), exist_ok=True)
        
        file.save(absolute_path)
        print("DEBUG: file.save() called successfully")
        
        # Devolver la URL relativa para guardar en la BD
        return f"/uploads/{relative_path}".replace('\\', '/')
    print(f"DEBUG: save_image returning None. file? {bool(file)}, allowed? {allowed_file(file.filename) if file else 'N/A'}")
    return None

def delete_image(image_url):
    if not image_url or not image_url.startswith('/uploads/'):
        return
    
    # Obtener la ruta relativa eliminando '/uploads/'
    relative_path = image_url.replace('/uploads/', '', 1)
    absolute_path = os.path.join(current_app.config['UPLOAD_FOLDER'], relative_path)
    
    if os.path.exists(absolute_path):
        os.remove(absolute_path)
