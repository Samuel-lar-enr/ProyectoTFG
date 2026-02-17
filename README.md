# Proyecto TFG Web para Iglesia
Mejorar la web de la iglesia haciéndola funcional, intuitiva y fácil de gestionar, manteniendo una estética similar a la web original.



## Backend

### Tablas E:R

**Usuario**
- id
- username
- email
- password
- estado
- fecha_creacion
- avatar

**Rol**
- id
- nombre
- descripcion

**Usuario_Rol**
- id
- id_user
- id_rol

**Area**
- id
- nombre
- descripcion

**Puesto**
- id
- id_user
- id_area
- id_rol
- requiere_confirmacion (boolean)
- estado

---

**Evento**
- id
- titulo
- descripcion
- fecha_inicio
- fecha_fin
- aforo_max
- estado
- id_area

**ReservaEvento**
- id
- id_user
- id_evento
- estado
- fecha_reserva
---
**Oracion**
- id
- id_user
- titulo
- contenido
- fecha_creacion
- duracion_dias
- estado

**Oracion_Recordatorio**
- id
- id_user
- id_oracion

---

**Blog**
- id
- id_user
- titulo
- contenido
- fecha_creacion
- estado
---
**Tag**
- id
- nombre
- tipo (blog, oracion, evento)

**Blog_Tag**
- id_blog
- id_tag

**Oracion_Tag**
- id_oracion
- id_tag

**Evento_Tag**
-id_evento
-id_tag

---
**Reaccion**
- id
- emoji

**Reaccion_Blog**
- id
- id_user
- id_blog
- id_reaccion


### Funcionalidades

- Registro de usuarios
- Login de usuarios
- Gestion de usuarios
- Gestion de roles
- Gestion de areas de trabajo 
- Gestion de puestos de trabajo
- Gestion de eventos 
- Gestion de oraciones
- Gestion de blogs
- Gestion de tags
- Gestion de reacciones
- Gestion de reservas de eventos
- Gestion de recordatorios de oraciones