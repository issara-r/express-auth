const express = require('express');
const app = express();
require('dotenv').config();
const { login, authenticateJWT, addUsers, getUser } = require('./authentication/auth'); // นำเข้า auth.js

const PORT = process.env.PORT || 9000;

// Middleware
app.use(express.json());

// เพิ่ม API สำหรับ Login
app.post('/api/register', addUsers)

app.post('/login', login);

app.get('/test', () => {
  return {
    test: "xxx"
  }
})

app.get('/api/user', authenticateJWT, async (req, res) => {
  try {
    const users = await getUser(); // เรียกใช้ฟังก์ชัน getUser
    res.status(200).json(users); // ส่งข้อมูลกลับเป็น JSON
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
