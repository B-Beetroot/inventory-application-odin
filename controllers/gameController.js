const db = require("../db/pool");

exports.game_list = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT
        games.id,
        games.title,
        games.release_date,
        games.price,
        STRING_AGG(DISTINCT genres.name, ', ') AS genre,
        STRING_AGG(DISTINCT developers.name, ', ') AS developer
      FROM games
      LEFT JOIN game_genres
        ON games.id = game_genres.game_id
      LEFT JOIN genres
        ON game_genres.genre_id = genres.id
      LEFT JOIN game_developers
        ON games.id = game_developers.game_id
      LEFT JOIN developers
        ON game_developers.developer_id = developers.id
      GROUP BY
        games.id,
        games.title,
        games.release_date,
        games.price
      ORDER BY games.title;
    `);

    res.render("games/index", {
      games: result.rows,
      title: "Games",
    });
  } catch (err) {
    next(err);
  }
};

exports.game_detail = async (req, res, next) => {
  try {
    const game = await db.query(
      `
      SELECT *
      FROM games
      WHERE id = $1;
      `,
      [req.params.id],
    );

    if (game.rows.length === 0) {
      return res.status(404).send("Game not found");
    }

    const genres = await db.query(
      `
      SELECT genres.*
      FROM genres
      JOIN game_genres
        ON genres.id = game_genres.genre_id
      WHERE game_genres.game_id = $1
      ORDER BY genres.name;
      `,
      [req.params.id],
    );

    const developers = await db.query(
      `
      SELECT developers.*
      FROM developers
      JOIN game_developers
        ON developers.id = game_developers.developer_id
      WHERE game_developers.game_id = $1
      ORDER BY developers.name;
      `,
      [req.params.id],
    );

    res.render("games/show", {
      game: game.rows[0],
      genres: genres.rows,
      developers: developers.rows,
      title: "Game Details",
    });
  } catch (err) {
    next(err);
  }
};

exports.game_create_get = async (req, res, next) => {
  try {
    const genres = await db.query(`
      SELECT *
      FROM genres
      ORDER BY name;
    `);

    const developers = await db.query(`
      SELECT *
      FROM developers
      ORDER BY name;
    `);

    res.render("games/create", {
      genres: genres.rows,
      developers: developers.rows,
      title: "Add Game",
    });
  } catch (err) {
    next(err);
  }
};

exports.game_create_post = async (req, res, next) => {
  try {
    const { title, description, release_date, price, genres, developers } =
      req.body;

    const game = await db.query(
      `
      INSERT INTO games
        (title, description, release_date, price)
      VALUES
        ($1, $2, $3, $4)
      RETURNING id;
      `,
      [title, description, release_date || null, price || null],
    );

    const gameId = game.rows[0].id;

    const selectedGenres = Array.isArray(genres)
      ? genres
      : genres
        ? [genres]
        : [];

    for (const genreId of selectedGenres) {
      await db.query(
        `
        INSERT INTO game_genres
          (game_id, genre_id)
        VALUES
          ($1, $2);
        `,
        [gameId, genreId],
      );
    }

    const selectedDevelopers = Array.isArray(developers)
      ? developers
      : developers
        ? [developers]
        : [];

    for (const developerId of selectedDevelopers) {
      await db.query(
        `
        INSERT INTO game_developers
          (game_id, developer_id)
        VALUES
          ($1, $2);
        `,
        [gameId, developerId],
      );
    }

    res.redirect("/games");
  } catch (err) {
    next(err);
  }
};

exports.game_update_get = async (req, res, next) => {
  try {
    const game = await db.query(
      `
      SELECT *
      FROM games
      WHERE id = $1;
      `,
      [req.params.id],
    );

    if (game.rows.length === 0) {
      return res.status(404).send("Game not found");
    }

    const genres = await db.query(`
      SELECT *
      FROM genres
      ORDER BY name;
    `);

    const developers = await db.query(`
      SELECT *
      FROM developers
      ORDER BY name;
    `);

    const selectedGenres = await db.query(
      `
      SELECT genre_id
      FROM game_genres
      WHERE game_id = $1
      ORDER BY genre_id;
      `,
      [req.params.id],
    );

    const selectedDevelopers = await db.query(
      `
      SELECT developer_id
      FROM game_developers
      WHERE game_id = $1
      ORDER BY developer_id;
      `,
      [req.params.id],
    );

    res.render("games/update", {
      game: game.rows[0],
      genres: genres.rows,
      developers: developers.rows,
      selectedGenres: selectedGenres.rows.map((row) => row.genre_id),
      selectedDevelopers: selectedDevelopers.rows.map(
        (row) => row.developer_id,
      ),
      title: "Update Game",
    });
  } catch (err) {
    next(err);
  }
};

exports.game_update_post = async (req, res, next) => {
  try {
    const { title, description, release_date, price, genres, developers } =
      req.body;

    const gameId = req.params.id;

    const existingGame = await db.query(
      `
      SELECT id
      FROM games
      WHERE id = $1;
      `,
      [gameId],
    );

    if (existingGame.rows.length === 0) {
      return res.status(404).send("Game not found");
    }

    await db.query(
      `
      UPDATE games
      SET
        title = $1,
        description = $2,
        release_date = $3,
        price = $4
      WHERE id = $5;
      `,
      [title, description, release_date || null, price || null, gameId],
    );

    await db.query(
      `
      DELETE FROM game_genres
      WHERE game_id = $1;
      `,
      [gameId],
    );

    const selectedGenres = Array.isArray(genres)
      ? genres
      : genres
        ? [genres]
        : [];

    for (const genreId of selectedGenres) {
      await db.query(
        `
        INSERT INTO game_genres
          (game_id, genre_id)
        VALUES
          ($1, $2);
        `,
        [gameId, genreId],
      );
    }

    await db.query(
      `
      DELETE FROM game_developers
      WHERE game_id = $1;
      `,
      [gameId],
    );

    const selectedDevelopers = Array.isArray(developers)
      ? developers
      : developers
        ? [developers]
        : [];

    for (const developerId of selectedDevelopers) {
      await db.query(
        `
        INSERT INTO game_developers
          (game_id, developer_id)
        VALUES
          ($1, $2);
        `,
        [gameId, developerId],
      );
    }

    res.redirect("/games");
  } catch (err) {
    next(err);
  }
};

exports.game_delete_post = async (req, res, next) => {
  try {
    const gameId = req.params.id;

    const existingGame = await db.query(
      `
      SELECT id
      FROM games
      WHERE id = $1;
      `,
      [gameId],
    );

    if (existingGame.rows.length === 0) {
      return res.status(404).send("Game not found");
    }

    await db.query(
      `
      DELETE FROM games
      WHERE id = $1;
      `,
      [gameId],
    );

    res.redirect("/games");
  } catch (err) {
    next(err);
  }
};
