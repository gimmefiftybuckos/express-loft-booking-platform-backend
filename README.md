# loft-radar-project-backend

Проект представляет собой backend-сервер для работы с пользователями, авторизацией, токенами и избранными элементами. Основные технологии: Node.js, Express, PostgreSQL, JWT.

### ToDo:

1. Users DB ✓
2. JWT generate and verify methods ✓
3. Token refresh ✓
4. Error catching ✓
5. Favorites DB ✓
6. Comments DB
7. Refactoring
8. Tests (?)

<br />
  
### Для запуска проекта необходимо:

**Значения из .env.example совпадают с .env!**

#### Установка зависимостей

1. Установить зависимости

```shell
npm i
```

2. Скопировать файл с переменными окружения:

```shell
cp .env.example .env
```

3. Запустить dev-сервер:

```shell
npm run dev
```

#### Создание базы данных

SQL-запросы:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255),
    login VARCHAR(255),
    password VARCHAR(255),
    registr_time TIMESTAMP
);

CREATE TABLE tokens (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users (user_id)
);

CREATE TABLE favorites (
    user_id VARCHAR(255) NOT NULL,
    loft_id VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (user_id),
    UNIQUE (user_id, loft_id)
);
```

#### Настройка подключения к базе данных

```typescript
import { Pool } from 'pg';

const pool = new Pool({
   user: 'postgres',
   host: 'localhost',
   database: 'loft_radar',
   password: 'root',
   port: 5432,
});

export default pool;
```

#### Переменные окружения

```env
SECRET_KEY=1b94ef099d2b4157
IV=8d95e39c02d3b52f7a4f1a0a1e5af5af
JWT_KEY=hekmlehpkoek
PORT=3000

DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=loft_radar
DB_PASSWORD=root
DB_PORT=5432
```
