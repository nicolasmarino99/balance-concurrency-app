const axios = require('axios');
const { performance } = require('perf_hooks');

const BASE_URL = 'http://localhost:3001';
const USER_ID = 1;
const REQUESTS = 10000;
const AMOUNT_PER_REQUEST = -2;

async function resetBalance() {
  try {
    await axios.post(`${BASE_URL}/balance/reset`, { 
      userId: USER_ID,
      balance: 10000 
    });
    console.log('Balance reset to 10,000');
  } catch (error) {
    console.error('Failed to reset balance:', error.message);
    process.exit(1);
  }
}

async function runConcurrencyTest() {
  await resetBalance();

  const requests = Array(REQUESTS).fill().map(() => 
    axios.post(`${BASE_URL}/balance/update`, {
      userId: USER_ID,
      amount: AMOUNT_PER_REQUEST
    })
    .then(res => ({ success: true, data: res.data }))
    .catch(err => ({ 
      success: false, 
      error: err.response?.data || err.message 
    }))
  );

  console.log(`Sending ${REQUESTS} concurrent requests...`);
  const startTime = performance.now();

  const results = await Promise.allSettled(requests);
  
  const duration = (performance.now() - startTime) / 1000;
  const successful = results.filter(r => r.value?.success).length;
  const failed = results.filter(r => !r.value?.success).length;

  console.log(`Test completed in ${duration.toFixed(2)} seconds`);
  console.log(`Successful requests: ${successful}`);
  console.log(`Failed requests: ${failed}`);
  
  try {
    const finalBalance = await axios.get(`${BASE_URL}/balance/${USER_ID}`);
    console.log(`Final balance should be 0:`, finalBalance.data.balance);
  } catch (error) {
    console.error('Failed to verify final balance:', error.message);
  }
}

runConcurrencyTest().catch(console.error);