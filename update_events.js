const fs = require('fs');
let c = fs.readFileSync('frontend/src/features/events/api/eventsService.ts', 'utf8');

c = c.replace(/  uploadEventImage: async/, `  getRegistrationStatus: async (eventId: number, userId: number): Promise<any> => {
    const response = await api.get(\`/events/\${eventId}/registration?user_id=\${userId}\`);
    return response.data;
  },

  cancelRegistration: async (eventId: number, userId: number): Promise<any> => {
    const response = await api.post(\`/events/\${eventId}/cancel\`, { user_id: userId });
    return response.data;
  },

  messageMembers: async (eventId: number, data: { subject: string; message: string }): Promise<any> => {
    const response = await api.post(\`/events/\${eventId}/message\`, data);
    return response.data;
  },

  announceEvent: async (id: number): Promise<any> => {
    const response = await api.post(\`/events/\${id}/announce\`);
    return response.data;
  },

  uploadEventImage: async`);
fs.writeFileSync('frontend/src/features/events/api/eventsService.ts', c, 'utf8');
