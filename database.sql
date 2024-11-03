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
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

CREATE TABLE lofts (
    id SERIAL PRIMARY KEY,
    loft_id UUID UNIQUE NOT NULL,           
    title VARCHAR(255),                       
    metro VARCHAR(255),           
    walk INT,         
    price INT,                       
    persons INT,                      
    places INT,                   
    area INT,    
    date TIMESTAMP DEFAULT NOW()                    
);

CREATE TABLE favorites (
    user_id VARCHAR(255) NOT NULL,
    loft_id UUID NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    FOREIGN KEY (loft_id) REFERENCES lofts (loft_id) ON DELETE CASCADE,
    UNIQUE (user_id, loft_id)
);

CREATE TABLE loft_images (
    loft_id UUID REFERENCES lofts(loft_id) ON DELETE CASCADE, 
    image_url VARCHAR(255)                              
);

CREATE TABLE loft_description (
    loft_id UUID REFERENCES lofts(loft_id) ON DELETE CASCADE, 
    loft_description TEXT         
);

CREATE TABLE loft_types (
    loft_id UUID REFERENCES lofts(loft_id) ON DELETE CASCADE, 
    type VARCHAR(100)                                   
);

CREATE TABLE loft_rules (
    loft_id UUID REFERENCES lofts(loft_id) ON DELETE CASCADE, 
    rule VARCHAR(255)                                   
);

CREATE TABLE loft_booking_dates (
    loft_id UUID REFERENCES lofts(loft_id) ON DELETE CASCADE, 
    booking_date VARCHAR(255)                              
);

CREATE TABLE loft_comments (
    id SERIAL PRIMARY KEY,          
    loft_id UUID REFERENCES lofts(loft_id) ON DELETE CASCADE NOT NULL,      
    user_id VARCHAR(255) REFERENCES users(user_id) ON DELETE CASCADE NOT NULL, 
    login VARCHAR(255) NOT NULL,
    comment_text TEXT NOT NULL,          
    rating INT NOT NULL,                
    comment_date TIMESTAMP DEFAULT NOW() 
);

drop table favorites;
drop table lofts CASCADE;
drop table loft_description;
drop table loft_booking_dates;
drop table loft_images;
drop table loft_rules;
drop table loft_types;
drop table loft_comments;