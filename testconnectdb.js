const sql = require("mssql");
const { TYPES } = require("mssql");
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

const x = async () => {
  const pool = new sql.ConnectionPool(sqlConfig);
  const poolConnect = pool.connect();
  console.log("pool", pool)
  const getUserByName = async () => {
    await poolConnect;
    try {
      const result = await pool.request()
        .query(`SELECT *
            FROM tb_user`);
      return {
        result: result.recordset,
        err: null
      };
    } catch (err) {
      return {
        result: null,
        err
      };
    }
  };
  console.log(await getUserByName("Timur"));
};
x();