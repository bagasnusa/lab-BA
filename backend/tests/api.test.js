const http = require('http');
const { app, startServer } = require('../src/server');

let server;
const PORT = 3099;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    if (postData) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const options = {
      hostname: 'localhost',
      port: PORT,
      path,
      method,
      headers: reqHeaders
    };

    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('\n🧪 Starting LAB ILKOM Backend Automated Tests...\n');
  const db = require('../src/data/db');
  await db.initMysql();
  server = app.listen(PORT);

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    await test('GET /api/health should return status OK', async () => {
      const res = await request('GET', '/api/health');
      if (res.status !== 200 || res.body.status !== 'OK') {
        throw new Error(`Expected status 200 with status OK, got ${res.status}`);
      }
    });

    // 2. Get labs
    await test('GET /api/labs should return list of laboratories', async () => {
      const res = await request('GET', '/api/labs');
      if (res.status !== 200 || !res.body.success || res.body.data.length < 5) {
        throw new Error(`Expected at least 5 labs, got ${res.body?.data?.length}`);
      }
    });

    // 3. Quick Login Mahasiswa Bagas
    let mhsToken = '';
    await test('POST /api/auth/quick-login (Mahasiswa) should return JWT token', async () => {
      const res = await request('POST', '/api/auth/quick-login', { role: 'mahasiswa' });
      if (res.status !== 200 || !res.body.token || res.body.user.role !== 'mahasiswa') {
        throw new Error('Quick login mahasiswa failed');
      }
      mhsToken = res.body.token;
    });

    // 4. Quick Login Dosen
    let dosenToken = '';
    await test('POST /api/auth/quick-login (Dosen) should return JWT token', async () => {
      const res = await request('POST', '/api/auth/quick-login', { role: 'dosen' });
      if (res.status !== 200 || !res.body.token || res.body.user.role !== 'dosen') {
        throw new Error('Quick login dosen failed');
      }
      dosenToken = res.body.token;
    });

    // 5. Quick Login Admin
    let adminToken = '';
    await test('POST /api/auth/quick-login (Admin) should return JWT token', async () => {
      const res = await request('POST', '/api/auth/quick-login', { role: 'admin' });
      if (res.status !== 200 || !res.body.token || res.body.user.role !== 'admin') {
        throw new Error('Quick login admin failed');
      }
      adminToken = res.body.token;
    });

    // 6. Create new booking
    let createdBookingId = '';
    const testDate = `2026-11-${Math.floor(Math.random() * 20 + 10)}`;
    await test('POST /api/bookings should create booking and return waiting status', async () => {
      const res = await request(
        'POST',
        '/api/bookings',
        {
          labId: 'LAB-05',
          date: testDate,
          session: 'siang',
          timeSlot: '13:00 - 16:30 (Sesi Siang)',
          purpose: 'Uji Coba Sensor IoT Kelembaban Tanah untuk Smart Agriculture',
          category: 'Riset Skripsi / Tugas Akhir',
          dosenId: 'usr_dosen1',
          equipments: ['Raspberry Pi 5 (8GB) Master IoT Kit'],
          participantsCount: 2
        },
        { Authorization: `Bearer ${mhsToken}` }
      );

      if (res.status !== 201 || !res.body.success || !res.body.data.id) {
        throw new Error(`Failed to create booking: ${JSON.stringify(res.body)}`);
      }
      createdBookingId = res.body.data.id;
      if (res.body.data.status !== 'menunggu_dosen') {
        throw new Error(`Expected status 'menunggu_dosen', got '${res.body.data.status}'`);
      }
    });

    // 7. Dosen Approves booking
    await test('PATCH /api/bookings/:id/status (Dosen approve) should transition to menunggu_admin', async () => {
      const res = await request(
        'PATCH',
        `/api/bookings/${createdBookingId}/status`,
        {
          action: 'approve_dosen',
          notes: 'Riset relevan dan disetujui pembimbing.'
        },
        { Authorization: `Bearer ${dosenToken}` }
      );

      if (res.status !== 200 || res.body.data.status !== 'menunggu_admin') {
        throw new Error(`Expected status 'menunggu_admin', got '${res.body?.data?.status}'`);
      }
    });

    // 8. Admin Approves booking
    let qrData = '';
    await test('PATCH /api/bookings/:id/status (Admin approve) should transition to disetujui_admin', async () => {
      const res = await request(
        'PATCH',
        `/api/bookings/${createdBookingId}/status`,
        {
          action: 'approve_admin',
          notes: 'Ruang lab IoT dan kit Raspberry Pi telah dialokasikan.'
        },
        { Authorization: `Bearer ${adminToken}` }
      );

      if (res.status !== 200 || res.body.data.status !== 'disetujui_admin') {
        throw new Error(`Expected status 'disetujui_admin', got '${res.body?.data?.status}'`);
      }
      qrData = res.body.data.qrCodeData;
    });

    // 9. QR Check-in
    await test('POST /api/bookings/checkin with QR code should mark booking as sedang_berlangsung', async () => {
      const res = await request(
        'POST',
        '/api/bookings/checkin',
        { qrCodeData: qrData },
        { Authorization: `Bearer ${adminToken}` }
      );

      if (res.status !== 200 || res.body.data.status !== 'sedang_berlangsung') {
        throw new Error(`Expected status 'sedang_berlangsung', got '${res.body?.data?.status}'`);
      }
    });

    // 10. Dashboard Stats
    await test('GET /api/stats/dashboard should return populated overview counters', async () => {
      const res = await request('GET', '/api/stats/dashboard', null, {
        Authorization: `Bearer ${adminToken}`
      });

      if (res.status !== 200 || !res.body.data.overview.totalLabs) {
        throw new Error(`Dashboard stats empty: ${JSON.stringify(res.body)}`);
      }
    });

  } finally {
    server.close();
  }

  console.log(`\n📊 Test Summary: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) process.exit(1);
}

runTests();
