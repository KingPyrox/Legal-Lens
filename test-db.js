const { Client } = require('pg');

const client = new Client({
  host: '172.18.0.3',
  port: 5432,
  database: 'legallens',
  user: 'postgres',
  password: 'password'
});

client.connect()
  .then(() => {
    console.log('Connected successfully!');
    return client.query('SELECT NOW()');
  })
  .then(result => {
    console.log('Current time:', result.rows[0].now);
    client.end();
  })
  .catch(err => {
    console.error('Connection error:', err.message);
    client.end();
  });