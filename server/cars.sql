DROP TABLE IF EXISTS cars;
CREATE TABLE IF NOT EXISTS cars (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    brand VARCHAR(50) NOT NULL,
    color VARCHAR(10) NOT NULL,
    year VARCHAR(10) NOT NULL
);

-- Insert sample data into the cars table
INSERT INTO cars (brand, color, year) VALUES 
('ferrari', 'red', '2022'),
('saab', 'yellow', '1995'),
('honda', 'grey', '2014'),
('toyota', 'blue', '1955'),
('porsche', 'green', '1995');

