import fetch from 'node-fetch';

async function test() {
  try {
    // 1. login to get cookie
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'souradeepmandal459@gmail.com', password: 'password123' }) // assuming this is the admin credentials
    });
    const cookie = loginRes.headers.raw()['set-cookie'];
    console.log("Login status:", loginRes.status);
    if (!cookie) {
        console.log("No cookie returned");
        return;
    }
    
    // 2. fetch users
    const usersRes = await fetch('http://localhost:5000/api/auth/users', {
      method: 'GET',
      headers: {
        'Cookie': cookie[0]
      }
    });
    
    const data = await usersRes.text();
    console.log("Users status:", usersRes.status);
    console.log("Users Data:", data.substring(0, 100) + '...');
  } catch (error) {
    console.error(error);
  }
}
test();
