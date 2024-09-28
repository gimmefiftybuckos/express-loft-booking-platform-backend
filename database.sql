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

