# Балансовое приложение на Node.js
Это простое веб-приложение для управления балансом пользователей с использованием:

- Node.js + Express
- PostgreSQL + Sequelize ORM
- Миграции через Umzug

Установка
Клонировать репозиторий:

bash
Copy

```bash
git clone git@github.com:nicolasmarino99/balance-concurrency-app.git
```

```bash 
cd balance-app
```

Установить зависимости:

```bash
npm install
```
Настроить базу данных:

- Установите PostgreSQL

- Создайте файл config/config.json на основе config/config.example.json

- Укажите свои учетные данные для базы данных

Запуск приложения
Запустите сервер:

```bash
npm start
```
> Приложение будет доступно по адресу: http://localhost:3001


API Endpoints
1. Получить баланс пользователя

> GET /balance/:userId
Пример:

```bash
curl http://localhost:3001/balance/1
```
2. Обновить баланс

> POST /balance/update
Параметры:

- userId - ID пользователя
- amount - Сумма изменения (может 
быть отрицательной)

Пример (уменьшить баланс на 100):

```bash
curl -X POST http://localhost:3001/balance/update \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "amount": -100}'
```

3. Сбросить баланс (для тестирования)

> POST /balance/reset
Параметры:

- userId - ID пользователя
- balance - Новое значение баланса

Пример:

```bash
curl -X POST http://localhost:3001/balance/reset \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "balance": 10000}'
```
# Тестирование
Тест конкурентных запросов
Для проверки работы с конкурентными запросами выполните:

```bash
npm run migrate
```

```bash
npm run test:concurrency
```
Это отправит 10,000 запросов на списание по 2 единицы. Ожидается:

- 5,000 успешных запросов
- 5,000 ошибок "Недостаточно средств"
- Итоговый баланс должен быть 0

## Требования
- Node.js v14+
- PostgreSQL 12+
- Настроенный config/config.json

## Особенности реализации
- Гарантируется отсутствие отрицательного баланса
- Используются транзакции с уровнем изоляции SERIALIZABLE
- Применяется блокировка строк при обновлении баланса
- Есть начальная миграция, создающая пользователя с балансом 10,000
