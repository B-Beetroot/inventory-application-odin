const db = require("../db/pool");

exports.genre_list = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT *
      FROM genres
      ORDER BY name;
    `);

    res.render("genres/index", {
      genres: result.rows,
      title: "Genres",
    });
  } catch (err) {
    next(err);
  }
};

exports.genre_detail = async (req, res, next) => {
  try {
    const genre = await db.query(
      `
      SELECT *
      FROM genres
      WHERE id = $1;
      `,
      [req.params.id],
    );

    if (genre.rows.length === 0) {
      return res.status(404).send("Genre not found");
    }

    const games = await db.query(
      `
      SELECT games.*
      FROM games

      JOIN game_genres
        ON games.id = game_genres.game_id

      WHERE game_genres.genre_id = $1

      ORDER BY games.title;
      `,
      [req.params.id],
    );

    res.render("genres/show", {
      genre: genre.rows[0],
      games: games.rows,
      title: "Genre Details",
    });
  } catch (err) {
    next(err);
  }
};

exports.genre_create_get = (req, res) => {
  res.render("genres/create", {
    title: "Add Genre",
  });
};

exports.genre_create_post = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    await db.query(
      `
      INSERT INTO genres
        (name, description)

      VALUES
        ($1, $2);
      `,
      [name, description],
    );

    res.redirect("/genres");
  } catch (err) {
    next(err);
  }
};

exports.genre_update_get = async (req, res, next) => {
  try {
    const result = await db.query(
      `
      SELECT *
      FROM genres
      WHERE id = $1;
      `,
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Genre not found");
    }

    res.render("genres/update", {
      genre: result.rows[0],
      title: "Update Genre",
    });
  } catch (err) {
    next(err);
  }
};

exports.genre_update_post = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const existingGenre = await db.query(
      `
      SELECT id
      FROM genres
      WHERE id = $1;
      `,
      [req.params.id],
    );

    if (existingGenre.rows.length === 0) {
      return res.status(404).send("Genre not found");
    }

    await db.query(
      `
      UPDATE genres

      SET
        name = $1,
        description = $2

      WHERE id = $3;
      `,
      [name, description, req.params.id],
    );

    res.redirect("/genres");
  } catch (err) {
    next(err);
  }
};

exports.genre_delete_post = async (req, res, next) => {
  try {
    const genreId = req.params.id;

    const existingGenre = await db.query(
      `
      SELECT id
      FROM genres
      WHERE id = $1;
      `,
      [genreId],
    );

    if (existingGenre.rows.length === 0) {
      return res.status(404).send("Genre not found");
    }

    await db.query(
      `
      DELETE FROM game_genres
      WHERE genre_id = $1;
      `,
      [genreId],
    );

    await db.query(
      `
      DELETE FROM genres
      WHERE id = $1;
      `,
      [genreId],
    );

    res.redirect("/genres");
  } catch (err) {
    next(err);
  }
};
