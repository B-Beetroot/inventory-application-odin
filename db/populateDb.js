const db = require("./pool");

async function populateDatabase() {
  await db.query(`
    DROP TABLE IF EXISTS game_genres;
    DROP TABLE IF EXISTS game_developers;
    DROP TABLE IF EXISTS games;
    DROP TABLE IF EXISTS genres;
    DROP TABLE IF EXISTS developers;

    CREATE TABLE developers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      country VARCHAR(100)
    );

    CREATE TABLE genres (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT
    );

    CREATE TABLE games (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      release_date DATE,
      price DECIMAL(10,2)
    );

    CREATE TABLE game_developers (
      game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
      developer_id INTEGER REFERENCES developers(id) ON DELETE CASCADE,
      PRIMARY KEY (game_id, developer_id)
    );

    CREATE TABLE game_genres (
      game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
      genre_id INTEGER REFERENCES genres(id) ON DELETE CASCADE,
      PRIMARY KEY (game_id, genre_id)
    );
  `);

  await db.query(`
    INSERT INTO developers (name, country)
    VALUES
      ('Mojang', 'Sweden'),
      ('FromSoftware', 'Japan'),
      ('CD Projekt Red', 'Poland'),
      ('Nintendo', 'Japan'),
      ('Rockstar Games', 'United States'),
      ('Naughty Dog', 'United States'),
      ('Larian Studios', 'Belgium'),
      ('Valve', 'United States');
  `);

  await db.query(`
    INSERT INTO genres (name, description)
    VALUES
      ('RPG', 'Role-playing games focused on characters, progression and choices'),
      ('Action', 'Fast-paced games focused on combat and physical challenges'),
      ('Adventure', 'Games centered around exploration, discovery and storytelling'),
      ('Strategy', 'Games focused on planning, tactics and decision making'),
      ('Simulation', 'Games that recreate real-world activities or systems'),
      ('Horror', 'Games designed around fear, tension and unsettling environments'),
      ('Sandbox', 'Open-ended games that give players freedom to create and explore'),
      ('Platformer', 'Games focused on movement, jumping and navigating platforms');
  `);

  await db.query(`
    INSERT INTO games
      (title, description, release_date, price)
    VALUES
      (
        'Minecraft',
        'A sandbox game where players explore, build and survive in a procedurally generated world.',
        '2011-11-18',
        29.99
      ),
      (
        'Elden Ring',
        'An open-world action RPG featuring challenging combat, exploration and a large fantasy world.',
        '2022-02-25',
        59.99
      ),
      (
        'The Witcher 3',
        'A fantasy RPG following Geralt of Rivia through a vast world filled with quests and monsters.',
        '2015-05-19',
        39.99
      ),
      (
        'The Legend of Zelda: Breath of the Wild',
        'An open-world adventure game focused on exploration, puzzles and discovering the world of Hyrule.',
        '2017-03-03',
        59.99
      ),
      (
        'Grand Theft Auto V',
        'An open-world action game set in the fictional state of San Andreas.',
        '2013-09-17',
        29.99
      ),
      (
        'The Last of Us Part I',
        'A story-driven action adventure following Joel and Ellie through a post-apocalyptic United States.',
        '2022-09-02',
        69.99
      ),
      (
        'Baldur''s Gate 3',
        'A party-based fantasy RPG featuring deep character customization, choices and turn-based combat.',
        '2023-08-03',
        59.99
      ),
      (
        'Half-Life 2',
        'A first-person action game combining physics-based gameplay with a science-fiction story.',
        '2004-11-16',
        9.99
      ),
      (
        'Animal Crossing: New Horizons',
        'A relaxing life simulation game where players build and customize their own island.',
        '2020-03-20',
        59.99
      ),
      (
        'Super Mario Odyssey',
        'A colorful 3D platforming adventure featuring Mario travelling across different kingdoms.',
        '2017-10-27',
        59.99
      );
  `);

  await db.query(`
    INSERT INTO game_developers (game_id, developer_id)
    VALUES
      (1, 1),
      (1, 4),

      (2, 2),

      (3, 3),

      (4, 4),

      (5, 5),

      (6, 6),

      (7, 7),

      (8, 8),

      (9, 4),

      (10, 4);
  `);

  await db.query(`
    INSERT INTO game_genres (game_id, genre_id)
    VALUES
      (1, 7),
      (1, 3),
      (1, 5),

      (2, 1),
      (2, 2),
      (2, 3),

      (3, 1),
      (3, 3),
      (3, 2),

      (4, 3),
      (4, 8),
      (4, 7),

      (5, 2),
      (5, 3),
      (5, 5),

      (6, 2),
      (6, 3),
      (6, 6),

      (7, 1),
      (7, 2),
      (7, 3),
      (7, 4),

      (8, 2),
      (8, 3),

      (9, 5),
      (9, 7),

      (10, 8),
      (10, 3);
  `);

  console.log("Database created and populated!");

  await db.end();
}

populateDatabase();
