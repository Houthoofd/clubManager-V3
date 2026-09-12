const fs = require('fs');
const { execSync } = require('child_process');

const dbs = ['tenant_fcbj', 'tenant_tcp', 'tenant_jcl', 'tenant_asmn', 'tenant_bdxa'];
let schema = fs.readFileSync('db/creation/SCHEMA_CONSOLIDATE.sql', 'utf8');

dbs.forEach(db => {
    console.log('Creating ' + db + '...');
    const localSchema = schema.replace(/clubmanager/g, db);
    fs.writeFileSync('temp_' + db + '.sql', localSchema);
    try {
        execSync('mysql -u root < temp_' + db + '.sql');
    } catch (e) {
        console.error("Error creating " + db, e.message);
    }
    fs.unlinkSync('temp_' + db + '.sql');
    console.log(db + ' created!');
});
