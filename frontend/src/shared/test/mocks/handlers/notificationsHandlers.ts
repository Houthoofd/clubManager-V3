import { http, HttpResponse } from 'msw';

const mockNotification = {
  id: 1,
  userId: 1,
  title: 'Test notification',
  message: 'Test notification message',
  type: 'info' as const,
  read: false,
  createdAt: new Date().toISOString(),
};

export const notificationsHandlers = [
  http.get('/api/notifications', () =>
    HttpResponse.json({ success: true, data: [mockNotification] }),
  ),

  http.get('/api/notifications/unread-count', () =>
    HttpResponse.json({ success: true, data: { count: 1 } }),
  ),

  http.patch('/api/notifications/:id/read', ({ params }) =>
    HttpResponse.json({
      success: true,
      data: { ...mockNotification, id: Number(params.id), read: true },
    }),
  ),

  http.patch('/api/notifications/read-all', () =>
    HttpResponse.json({ success: true, data: null }),
  ),

  http.delete('/api/notifications/:id', () =>
    HttpResponse.json({ success: true, data: null }),
  ),

  http.delete('/api/notifications', () =>
    HttpResponse.json({ success: true, data: null }),
  ),

  http.post('/api/notifications/broadcast', () =>
    HttpResponse.json({ success: true, data: null }, { status: 201 }),
  ),
];
