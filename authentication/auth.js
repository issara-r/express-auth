const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sql = require('mssql');
const sqlConfig = {
  server: 'Issara', // ชื่อเซิร์ฟเวอร์หรือ IP
  database: 'Personal', // ชื่อฐานข้อมูล
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  authentication: {
    type: 'default', // ใช้ Windows Authentication
    options: {
      domain: 'ISSARA', // ชื่อโดเมนของระบบ
      userName: 'ssa', // ไม่ต้องใส่ username สำหรับ Windows Authentication
      password: '12345', // ไม่ต้องใส่ password สำหรับ Windows Authentication
    },
  },
};

// ฟังก์ชันตรวจสอบการ login
const login = async (req, res) => {
  const { username, password } = req.body;

  const pool = new sql.ConnectionPool(sqlConfig);
  const poolConnect = await pool.connect(); // รอให้การเชื่อมต่อเสร็จ
  const result = await poolConnect.request()
    .query(`SELECT uid, username, password
    FROM tb_user
    WHERE username ='` + username + "'");
  const user = result.recordset.find(u => u.username === username);
  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  bcrypt.compare(password, user.password, (err, result) => {
    if (err || !result) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // สร้าง JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Login successful', token });
  });
};

// JWT Middleware ตรวจสอบการยืนยันตัวตน
const authenticateJWT = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};


const getUser = async () => {
  const pool = new sql.ConnectionPool(sqlConfig);
  const poolConnect = await pool.connect(); // รอให้การเชื่อมต่อเสร็จ
  try {
    const result = await poolConnect.request()
      .query(`SELECT * FROM tb_user`);
    return {
      result: result.recordset,
      error: null
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Error fetching users');
  }
};

const addUsers = async (req, res) => {
  try {
    const { username, password } = req.body; // รับข้อมูลจาก body
    const hashedPassword = await bcrypt.hash(password, 10); // เข้ารหัสรหัสผ่าน

    // เชื่อมต่อกับ database
    const pool = new sql.ConnectionPool(sqlConfig);
    const poolConnect = await pool.connect(); // รอให้การเชื่อมต่อเสร็จ

    if (!poolConnect) {
      return res.status(500).json({ error: 'Database connection failed' });
    }

    // ใช้ pool.request() เพื่อ query
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .input('password', sql.NVarChar, hashedPassword)
      .query(`
        INSERT INTO tb_user (username, password)
        VALUES (@username, @password)
      `);  // ใช้ @parameter เพื่อป้องกัน SQL Injection

    res.status(201).json({ message: 'User added successfully!' });
  } catch (error) {
    console.error('Error adding user:');
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { login, authenticateJWT, addUsers, getUser };
