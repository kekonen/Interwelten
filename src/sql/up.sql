CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE user_role (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    role_name VARCHAR(10) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE picture (
    id SERIAL PRIMARY KEY,
    cached_file_id VARCHAR(70),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE dictionary (
    id SERIAL PRIMARY KEY,
    english VARCHAR(40),
    german VARCHAR(40),
    russian VARCHAR(40),
    finnish VARCHAR(40),
    swedish VARCHAR(40),
    synonyms VARCHAR(100),
    picture_id INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("picture_id") REFERENCES picture(id)
);

CREATE TABLE task (
  id SERIAL PRIMARY KEY,
  chat_id INTEGER NOT NULL,
  message_type INTEGER NOT NULL,
  task VARCHAR(15) NOT NULL,
  content VARCHAR(40) NOT NULL,
  fullfilled BOOLEAN NOT NULL DEFAULT 'f',
  fullfilled_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);