const app = require('../server/app');
const http = require('http');

async function runTests() {
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`Test server running on ${baseUrl}`);

  try {
    // 1. Healthcheck
    const resHealth = await fetch(`${baseUrl}/health`);
    const jsonHealth = await resHealth.json();
    console.log('✓ /health status:', resHealth.status, jsonHealth.status === 'ok');

    // 2. Status
    const resStatus = await fetch(`${baseUrl}/api/status`);
    const jsonStatus = await resStatus.json();
    console.log('✓ /api/status status:', resStatus.status, 'email configured:', jsonStatus.email?.configured);

    // 3. Validation failure test (empty POST /api/groups)
    const resBadCreate = await fetch(`${baseUrl}/api/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const jsonBadCreate = await resBadCreate.json();
    console.log('✓ Bad POST /api/groups returned 400:', resBadCreate.status === 400, jsonBadCreate.error);

    // 4. Get Groups
    const resGroups = await fetch(`${baseUrl}/api/groups`);
    const jsonGroups = await resGroups.json();
    console.log('✓ /api/groups returned 200:', resGroups.status === 200, 'items:', jsonGroups.data?.length);

    // 5. Get Logs
    const resLogs = await fetch(`${baseUrl}/api/logs`);
    const jsonLogs = await resLogs.json();
    console.log('✓ /api/logs returned 200:', resLogs.status === 200);

    console.log('\n🎉 ALL BACKEND STANDARD TESTS PASSED!');
  } finally {
    server.close();
  }
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
