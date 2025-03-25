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
    console.log('✅ Баланс успешно сброшен до 10000');
  } catch (error) {
    console.error('❌ Ошибка сброса баланса:', error.message);
    process.exit(1);
  }
}

async function runConcurrencyTest() {
  console.log('🔄 Подготовка к тесту...');
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

  console.log(`🚀 Запуск ${REQUESTS} конкурентных запросов...`);
  const startTime = performance.now();

  const results = await Promise.allSettled(requests);
  
  const duration = (performance.now() - startTime) / 1000;
  const successful = results.filter(r => r.value?.success).length;
  const failed = results.filter(r => !r.value?.success).length;

  console.log('\n📊 Результаты теста:');
  console.log(`⏱ Время выполнения: ${duration.toFixed(2)} сек`);
  console.log(`✅ Успешных запросов: ${successful}`);
  console.log(`❌ Неудачных запросов: ${failed}`);

  console.log('\n🔍 Проверка итогового баланса...');
  try {
    const response = await axios.get(`${BASE_URL}/balance/${USER_ID}`);
    console.log(`💰 Итоговый баланс: ${response.data.balance}`);
    console.log(`📌 Ожидаемый баланс: 0`)
  } catch (error) {
    console.error('Ошибка при проверке баланса:', error.message);
  }
}

runConcurrencyTest().catch(console.error);