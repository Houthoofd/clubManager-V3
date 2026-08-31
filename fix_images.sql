UPDATE images SET url = REPLACE(url, 'http://localhost:3000', 'https://club-management.com') WHERE url LIKE '%localhost%';
