FROM python:3.11-slim

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema para MariaDB/MySQL
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    build-essential \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copiar el archivo de requerimientos e instalarlos
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del código
COPY . .

# Exponer el puerto de Flask
EXPOSE 5000

# Variables de entorno por defecto
ENV FLASK_APP=main.py
ENV FLASK_ENV=development

# Comando para ejecutar la aplicación
CMD ["python", "main.py"]
