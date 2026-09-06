const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'clubmanager_master'
  });

  const dummyClubs = [
    { uuid: 'uuid-1', name: 'FC Barcelone Junior', slug: 'fc-barcelone-jr', code: 'FCBJ', db_name: 'tenant_fcbj', email: 'contact@fcbj.com', status: 'active', plan: 'pro' },
    { uuid: 'uuid-2', name: 'Tennis Club de Paris', slug: 'tc-paris', code: 'TCP', db_name: 'tenant_tcp', email: 'admin@tcparis.fr', status: 'trial', plan: 'basic' },
    { uuid: 'uuid-3', name: 'Judo Club Lyon', slug: 'jc-lyon', code: 'JCL', db_name: 'tenant_jcl', email: 'hello@jc-lyon.fr', status: 'suspended', plan: 'pro' },
    { uuid: 'uuid-4', name: 'AS Monaco Natation', slug: 'asm-natation', code: 'ASMN', db_name: 'tenant_asmn', email: 'contact@asmn.mc', status: 'active', plan: 'premium' },
    { uuid: 'uuid-5', name: 'Bordeaux Athlétisme', slug: 'bdx-athle', code: 'BDXA', db_name: 'tenant_bdxa', email: 'direction@bdx-athle.fr', status: 'active', plan: 'basic' }
  ];

  for (const club of dummyClubs) {
    try {
      await connection.execute(
        `INSERT IGNORE INTO organizations (uuid, name, slug, code, db_name, contact_email, status, subscription_plan) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [club.uuid, club.name, club.slug, club.code, club.db_name, club.email, club.status, club.plan]
      );
    } catch (e) {
      console.log('Skipping ' + club.name, e.message);
    }
  }

  // Add dummy admins for some of them so the count is > 0
  const [orgs] = await connection.execute('SELECT id, code FROM organizations');
  for (const org of orgs) {
    if (org.code === 'FCBJ' || org.code === 'TCP') {
       try {
         await connection.execute(
           `INSERT IGNORE INTO master_users (email, password_hash, organization_id, global_role)
            VALUES (?, ?, ?, ?)`,
           [`admin@${org.code.toLowerCase()}.com`, 'hash', org.id, 'org_admin']
         );
       } catch (e) {}
    }
  }

  console.log('Données fictives insérées.');
  await connection.end();
}

run().catch(console.error);
