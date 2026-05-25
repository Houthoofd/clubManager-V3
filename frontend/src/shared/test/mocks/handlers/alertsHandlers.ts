import { http, HttpResponse } from 'msw';

const mockAlertType = {
  id: 1,
  code: 'LATE_PAYMENT',
  label: 'Paiement en retard',
  description: 'Alerte pour les paiements en retard',
  priorite: 'haute' as const,
  actif: true,
};

const mockUserAlert = {
  id: 1,
  typeId: 1,
  userId: 1,
  statut: 'ouverte' as const,
  message: 'Test alert message',
  createdAt: new Date().toISOString(),
};

const mockAlertAction = {
  id: 1,
  alertId: 1,
  adminId: 1,
  action: 'Prise en charge',
  note: 'Test note',
  createdAt: new Date().toISOString(),
};

export const alertsHandlers = [
  http.get('/api/alerts/types', () =>
    HttpResponse.json({ success: true, data: [mockAlertType] }),
  ),

  http.get('/api/alerts/types/:id', ({ params }) =>
    HttpResponse.json({ success: true, data: { ...mockAlertType, id: Number(params.id) } }),
  ),

  http.post('/api/alerts/types', () =>
    HttpResponse.json({ success: true, data: mockAlertType }, { status: 201 }),
  ),

  http.put('/api/alerts/types/:id', ({ params }) =>
    HttpResponse.json({
      success: true,
      data: { ...mockAlertType, id: Number(params.id) },
    }),
  ),

  http.delete('/api/alerts/types/:id', () =>
    HttpResponse.json({ success: true, data: null }),
  ),

  http.get('/api/alerts', () =>
    HttpResponse.json({ success: true, data: [mockUserAlert] }),
  ),

  http.get('/api/alerts/my', () =>
    HttpResponse.json({ success: true, data: [mockUserAlert] }),
  ),

  http.post('/api/alerts', () =>
    HttpResponse.json({ success: true, data: mockUserAlert }, { status: 201 }),
  ),

  http.patch('/api/alerts/:id/resolve', ({ params }) =>
    HttpResponse.json({
      success: true,
      data: { ...mockUserAlert, id: Number(params.id), statut: 'resolue' },
    }),
  ),

  http.patch('/api/alerts/:id/ignore', ({ params }) =>
    HttpResponse.json({
      success: true,
      data: { ...mockUserAlert, id: Number(params.id), statut: 'ignoree' },
    }),
  ),

  http.get('/api/alerts/:id/actions', () =>
    HttpResponse.json({ success: true, data: [mockAlertAction] }),
  ),

  http.post('/api/alerts/:id/actions', () =>
    HttpResponse.json({ success: true, data: mockAlertAction }, { status: 201 }),
  ),
];
