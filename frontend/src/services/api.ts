import axios from 'axios';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  MeResponse,
  GenericResponse,
  BlogPost,
  PostBlogRequest,
  Evento,
  Oracion,
  PostOracionRequest,
  Comentario,
  PostComentarioRequest,
  User,
  Area,
  PostAreaRequest,
  Rol,
  PostRolRequest,
  Tag,
  PostTagRequest,
  Puesto,
  PostPuestoRequest,
  ReservaEvento
} from '../types/apiTypes';

/**
 * Configuración de instancia de Axios para el TFG Iglesia
 * Usamos cookies de sesión (Flask-Login)
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Fundamental para las sesiones de Flask
});

/**
 * SERVICIOS DE AUTENTICACIÓN
 */
export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', data);
    return res.data;
  },
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/register', data);
    return res.data;
  },
  checkSession: async (): Promise<MeResponse> => {
    const res = await api.get<MeResponse>('/auth/check');
    return res.data;
  },
  logout: async (): Promise<GenericResponse> => {
    const res = await api.post<GenericResponse>('/auth/logout');
    return res.data;
  }
};

/**
 * SERVICIOS DE USUARIOS
 */
export const userService = {
  getAll: async (): Promise<User[]> => {
    const res = await api.get<User[]>('/usuarios');
    return res.data;
  },
  getById: async (id: number): Promise<User> => {
    const res = await api.get<User>(`/usuarios/${id}`);
    return res.data;
  },
  create: async (data: RegisterRequest): Promise<GenericResponse> => {
    const res = await api.post<GenericResponse>('/usuarios', data);
    return res.data;
  },
  update: async (id: number, data: Partial<RegisterRequest>): Promise<GenericResponse> => {
    const res = await api.put<GenericResponse>(`/usuarios/${id}`, data);
    return res.data;
  },
  delete: async (id: number): Promise<GenericResponse> => {
    const res = await api.delete<GenericResponse>(`/usuarios/${id}`);
    return res.data;
  }
};

/**
 * SERVICIOS DE BLOG Y COMENTARIOS
 */
export const blogService = {
  getAll: async (): Promise<BlogPost[]> => {
    const res = await api.get<BlogPost[]>('/blogs');
    return res.data;
  },
  getById: async (id: number): Promise<BlogPost> => {
    const res = await api.get<BlogPost>(`/blogs/${id}`);
    return res.data;
  },
  create: async (data: PostBlogRequest): Promise<BlogPost> => {
    const res = await api.post<BlogPost>('/blogs', data);
    return res.data;
  },
  update: async (id: number, data: Partial<PostBlogRequest>): Promise<BlogPost> => {
    const res = await api.put<BlogPost>(`/blogs/${id}`, data);
    return res.data;
  },
  delete: async (id: number): Promise<GenericResponse> => {
    const res = await api.delete<GenericResponse>(`/blogs/${id}`);
    return res.data;
  },
  // Comentarios dentro del blog
  getComments: async (blogId: number): Promise<Comentario[]> => {
    const res = await api.get<Comentario[]>(`/comentarios?blog_id=${blogId}`);
    return res.data;
  },
  addComment: async (data: PostComentarioRequest): Promise<GenericResponse> => {
    const res = await api.post<GenericResponse>('/comentarios', data);
    return res.data;
  },
  deleteComment: async (id: number): Promise<GenericResponse> => {
    const res = await api.delete<GenericResponse>(`/comentarios/${id}`);
    return res.data;
  }
};

/**
 * SERVICIOS DE EVENTOS Y RESERVAS
 */
export const eventService = {
  getAll: async (): Promise<Evento[]> => {
    const res = await api.get<Evento[]>('/eventos');
    return res.data;
  },
  getById: async (id: number): Promise<Evento> => {
    const res = await api.get<Evento>(`/eventos/${id}`);
    return res.data;
  },
  // Reservas
  getReservations: async (): Promise<ReservaEvento[]> => {
    const res = await api.get<ReservaEvento[]>('/reservas');
    return res.data;
  },
  createReservation: async (idEvento: number, idUser: number): Promise<GenericResponse> => {
    const res = await api.post<GenericResponse>('/reservas', { id_evento: idEvento, id_user: idUser });
    return res.data;
  },
  cancelReservation: async (id: number): Promise<GenericResponse> => {
    const res = await api.delete<GenericResponse>(`/reservas/${id}`);
    return res.data;
  }
};

/**
 * SERVICIOS DE ORACIONES
 */
export const prayerService = {
  getAll: async (): Promise<Oracion[]> => {
    const res = await api.get<Oracion[]>('/oraciones');
    return res.data;
  },
  getById: async (id: number): Promise<Oracion> => {
    const res = await api.get<Oracion>(`/oraciones/${id}`);
    return res.data;
  },
  create: async (data: PostOracionRequest): Promise<Oracion> => {
    const res = await api.post<Oracion>('/oraciones', data);
    return res.data;
  },
  delete: async (id: number): Promise<GenericResponse> => {
    const res = await api.delete<GenericResponse>(`/oraciones/${id}`);
    return res.data;
  }
};

/**
 * SERVICIOS DE ADMINISTRACIÓN (Áreas, Roles, Tags, Puestos)
 */
export const adminService = {
  // Áreas
  getAreas: () => api.get<Area[]>('/areas').then(res => res.data),
  createArea: (data: PostAreaRequest) => api.post<GenericResponse>('/areas', data).then(res => res.data),
  deleteArea: (id: number) => api.delete<GenericResponse>(`/areas/${id}`).then(res => res.data),
  
  // Roles
  getRoles: () => api.get<Rol[]>('/roles').then(res => res.data),
  createRol: (data: PostRolRequest) => api.post<GenericResponse>('/roles', data).then(res => res.data),
  
  // Tags
  getTags: () => api.get<Tag[]>('/tags').then(res => res.data),
  createTag: (data: PostTagRequest) => api.post<GenericResponse>('/tags', data).then(res => res.data),
  
  // Puestos
  getPuestos: () => api.get<Puesto[]>('/puestos').then(res => res.data),
  createPuesto: (data: PostPuestoRequest) => api.post<GenericResponse>('/puestos', data).then(res => res.data),
  deletePuesto: (id: number) => api.delete<GenericResponse>(`/puestos/${id}`).then(res => res.data),
};

export default api;
