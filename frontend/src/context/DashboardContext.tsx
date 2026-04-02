import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import type { User, BlogPost, Area, Tag, Rol } from '../types/apiTypes';

interface DashboardContextType {
  users: User[];
  blogs: BlogPost[];
  areas: Area[];
  roles: Rol[];
  tags: Tag[];
  loadingData: boolean;
  refreshUsers: () => Promise<void>;
  refreshBlogs: () => Promise<void>;
  refreshAreas: () => Promise<void>;
  refreshRoles: () => Promise<void>;
  refreshTags: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/usuarios/');
      if (res.data && Array.isArray(res.data.data)) {
        setUsers(res.data.data);
      } else if (Array.isArray(res.data)) {
        setUsers(res.data);
      }
    } catch (error) {
      console.error("DashboardContext: Error loading users", error);
    }
  };

  const fetchBlogs = async () => {
    try {
      const res = await api.get('/blogs/');
      if (res.data && Array.isArray(res.data.data)) {
        setBlogs(res.data.data);
      } else if (Array.isArray(res.data)) {
        setBlogs(res.data);
      }
    } catch (error) {
      console.error("DashboardContext: Error loading blogs", error);
    }
  };

  const fetchAreas = async () => {
    try {
      const res = await api.get('/areas/');
      if (res.data && Array.isArray(res.data.data)) {
        setAreas(res.data.data);
      } else if (Array.isArray(res.data)) {
        setAreas(res.data);
      }
    } catch (error) {
      console.error("DashboardContext: Error loading areas", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await api.get('/roles/');
      if (res.data && Array.isArray(res.data.data)) {
        setRoles(res.data.data);
      } else if (Array.isArray(res.data)) {
        setRoles(res.data);
      }
    } catch (error) {
      console.error("DashboardContext: Error loading roles", error);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await api.get('/tags/');
      if (res.data && Array.isArray(res.data.data)) {
        setTags(res.data.data);
      } else if (Array.isArray(res.data)) {
        setTags(res.data);
      }
    } catch (error) {
      console.error("DashboardContext: Error loading tags", error);
    }
  };

  const refreshAll = async () => {
    setLoadingData(true);
    await Promise.all([fetchUsers(), fetchBlogs(), fetchAreas(), fetchRoles(), fetchTags()]);
    setLoadingData(false);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  return (
    <DashboardContext.Provider value={{ 
      users, 
      blogs, 
      areas,
      roles,
      tags,
      loadingData, 
      refreshUsers: fetchUsers, 
      refreshBlogs: fetchBlogs,
      refreshAreas: fetchAreas,
      refreshRoles: fetchRoles,
      refreshTags: fetchTags
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
