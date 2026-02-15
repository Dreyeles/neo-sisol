import mysql from 'mysql2/promise';

const passwords = ['', '1234', 'root', 'admin', 'password'];
const users = ['root', 'admin'];

async function test() {
    for (const user of users) {
        for (const password of passwords) {
            try {
                const connection = await mysql.createConnection({
                    host: 'localhost',
                    user: user,
                    password: password,
                    database: 'sisol_db'
                });
                console.log(`✅ SUCCESS: user=${user}, password=${password}`);
                await connection.end();
                return;
            } catch (err) {
                console.log(`❌ FAIL: user=${user}, password=${password} - ${err.message}`);
            }
        }
    }
}

test();
