const fs = require('fs');

let api = fs.readFileSync('frontend/src/features/superadmin/api/superAdminApi.ts', 'utf8');

const newMethod = `
  impersonateClub: async (id: number): Promise<ApiResponse<{ token: string, refreshToken: string, user: any }>> => {
    const response = await apiClient.post<ApiResponse<{ token: string, refreshToken: string, user: any }>>(\`/superadmin/clubs/\${id}/impersonate\`);
    return response.data;
  },
`;

api = api.replace(/deleteClub: async/, newMethod + '\n  deleteClub: async');
fs.writeFileSync('frontend/src/features/superadmin/api/superAdminApi.ts', api);
