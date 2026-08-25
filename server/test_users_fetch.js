import fetch from 'node-fetch';

async function run() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'souradeepmandal459@gmail.com', password: 'password123' })
    });
    
    const cookie = loginRes.headers.raw()['set-cookie'];
    if (!cookie) {
      console.log('Login failed');
      console.log(await loginRes.text());
      return;
    }
    
    const usersRes = await fetch('http://localhost:5000/api/auth/users', {
      method: 'GET',
      headers: {
        'Cookie': cookie[0]
      }
    });
    
    console.log("Status:", usersRes.status);
    console.log("Data:", await usersRes.text());
  } catch (error) {
    console.error("Error:", error);
  }
}
run();
