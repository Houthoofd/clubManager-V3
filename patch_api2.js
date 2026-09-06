const fs = require('fs');
let api = fs.readFileSync('frontend/src/features/superadmin/api/superAdminApi.ts', 'utf8');

const newMethod = `
  extendTrial: async (id: number): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(\`/superadmin/clubs/\${id}/extend-trial\`);
    return response.data;
  },
`;

api = api.replace(/updateClubStatus: async/, newMethod + '\n  updateClubStatus: async');
fs.writeFileSync('frontend/src/features/superadmin/api/superAdminApi.ts', api);
