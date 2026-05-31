import client from './client';

// ── Contacts ──────────────────────────────────────────────
export const contactsApi = {
  list: (params?: Record<string, string>) => client.get('/contacts', { params }),
  get: (id: string) => client.get(`/contacts/${id}`),
  create: (data: Record<string, unknown>) => client.post('/contacts', data),
  update: (id: string, data: Record<string, unknown>) => client.put(`/contacts/${id}`, data),
  delete: (id: string) => client.delete(`/contacts/${id}`),
  optOut: (id: string) => client.post(`/contacts/${id}/opt-out`),
};

// ── SMS ───────────────────────────────────────────────────
export const smsApi = {
  sendSingle: (data: Record<string, unknown>) => client.post('/sms/send', data),
  sendTemplate: (data: Record<string, unknown>) => client.post('/sms/send-template', data),
  sendBulk: (recipients: unknown[]) => client.post('/sms/send-bulk', { recipients }),
};

// ── Messages ──────────────────────────────────────────────
export const messagesApi = {
  list: (params?: Record<string, string>) => client.get('/messages', { params }),
  get: (id: string) => client.get(`/messages/${id}`),
  retry: (id: string) => client.post(`/messages/${id}/retry`),
};

// ── Templates ─────────────────────────────────────────────
export const templatesApi = {
  list: () => client.get('/templates'),
  create: (data: Record<string, unknown>) => client.post('/templates', data),
  update: (id: string, data: Record<string, unknown>) => client.put(`/templates/${id}`, data),
  delete: (id: string) => client.delete(`/templates/${id}`),
};

// ── Conversations ─────────────────────────────────────────
export const conversationsApi = {
  list: (params?: Record<string, string>) => client.get('/conversations', { params }),
  get: (id: string) => client.get(`/conversations/${id}`),
  close: (id: string) => client.put(`/conversations/${id}/close`),
};

// ── Health ────────────────────────────────────────────────
export const healthApi = {
  check: () => axios.get('/health').then(r => r.data),
};

import axios from 'axios';
