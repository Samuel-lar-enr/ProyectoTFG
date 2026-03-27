/**
 * Tipos de datos específicos para el Proyecto TFG Iglesia
 */

export interface User {
  id: number;
  username: string;
  email: string;
  estado: number;
  avatar?: string;
  notificaciones: boolean;
  fecha_creacion: string;
  roles: string[];
}

export interface Rol {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface Area {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface Tag {
  id: number;
  nombre: string;
  tipo: string;
}

export interface Puesto {
  id: number;
  id_user: number;
  id_area: number;
  id_rol: number;
  requiere_confirmacion: boolean;
  estado: number;
}

export interface GenericResponse {
  status: 'success' | 'error';
  message: string;
}

export interface AuthResponse extends GenericResponse {
  user?: User;
}

export interface MeResponse {
  isAuthenticated: boolean;
  user?: User;
}

// Blog
export interface BlogPost {
  id: number;
  id_user: number;
  autor: string;
  titulo: string;
  contenido: string;
  fecha_creacion: string;
  estado: number;
  tags: string[];
}

// Comentarios
export interface Comentario {
  id: number;
  id_user: number;
  username: string;
  id_blog: number;
  id_padre?: number;
  contenido: string;
  imagen?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  estado: number;
  n_respuestas: number;
}

// Eventos
export interface Evento {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  ubicacion: string;
  capacidad: number;
  tags: string[];
  id_area?: number;
}

export interface ReservaEvento {
  id: number;
  id_user: number;
  id_evento: number;
  estado: number;
}

// Oraciones
export interface Oracion {
  id: number;
  id_user: number;
  autor: string;
  titulo: string;
  contenido: string;
  fecha_creacion: string;
  duracion_dias?: number;
  estado: number;
  tags: string[];
}

// --- PETICIONES (REQUESTS) ---

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  notificaciones?: boolean;
}

export interface PostBlogRequest {
  titulo: string;
  contenido: string;
  tags?: string[];
}

export interface PostOracionRequest {
  titulo: string;
  contenido: string;
  duracion_dias?: number;
  tags?: string[];
}

export interface PostComentarioRequest {
  id_user: number;
  id_blog: number;
  contenido: string;
  id_padre?: number;
  imagen?: string;
}

export interface PostAreaRequest {
  nombre: string;
  descripcion?: string;
}

export interface PostRolRequest {
  nombre: string;
  descripcion?: string;
}

export interface PostTagRequest {
  nombre: string;
  tipo: string;
}

export interface PostPuestoRequest {
  id_user: number;
  id_area: number;
  id_rol: number;
  requiere_confirmacion?: boolean;
  estado?: number;
}
