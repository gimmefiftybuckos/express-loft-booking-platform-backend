CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255),
    login VARCHAR(255),
    password VARCHAR(255),
    registrTime TIMESTAMP
);

CREATE TABLE tokens (
    user_id VARCHAR(255) UNIQUE,
    refresh_token VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE favorites (
    user_id VARCHAR(255) UNIQUE,
    ids TEXT[],
    FOREIGN KEY (user_id) REFERENCES users (id)
);

