const db = require("../db/pool");

exports.developer_list = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT *
      FROM developers
      ORDER BY name;
    `);

    res.render("developers/index", {
      developers: result.rows,
      title: "Developers",
    });
  } catch (err) {
    next(err);
  }
};

exports.developer_detail = async (req, res, next) => {
  try {
    const developer = await db.query(
      `
      SELECT *
      FROM developers
      WHERE id = $1;
      `,
      [req.params.id],
    );

    if (developer.rows.length === 0) {
      return res.status(404).send("Developer not found");
    }

    const games = await db.query(
      `
      SELECT games.*
      FROM games

      JOIN game_developers
        ON games.id = game_developers.game_id

      WHERE game_developers.developer_id = $1

      ORDER BY games.title;
      `,
      [req.params.id],
    );

    res.render("developers/show", {
      developer: developer.rows[0],
      games: games.rows,
      title: "Developer Details",
    });
  } catch (err) {
    next(err);
  }
};

exports.developer_create_get = (req, res) => {
  res.render("developers/create", {
    title: "Add Developer",
  });
};

exports.developer_create_post = async (req, res, next) => {
  try {
    const { name, country } = req.body;

    await db.query(
      `
      INSERT INTO developers
        (name, country)

      VALUES
        ($1, $2);
      `,
      [name, country],
    );

    res.redirect("/developers");
  } catch (err) {
    next(err);
  }
};

exports.developer_update_get = async (req, res, next) => {
  try {
    const result = await db.query(
      `
      SELECT *
      FROM developers
      WHERE id = $1;
      `,
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Developer not found");
    }

    res.render("developers/update", {
      developer: result.rows[0],
      title: "Update Developer",
    });
  } catch (err) {
    next(err);
  }
};

exports.developer_update_post = async (req, res, next) => {
  try {
    const { name, country } = req.body;

    const existingDeveloper = await db.query(
      `
      SELECT id
      FROM developers
      WHERE id = $1;
      `,
      [req.params.id],
    );

    if (existingDeveloper.rows.length === 0) {
      return res.status(404).send("Developer not found");
    }

    await db.query(
      `
      UPDATE developers

      SET
        name = $1,
        country = $2

      WHERE id = $3;
      `,
      [name, country, req.params.id],
    );

    res.redirect("/developers");
  } catch (err) {
    next(err);
  }
};

exports.developer_delete_post = async (req, res, next) => {
  try {
    const developerId = req.params.id;

    const existingDeveloper = await db.query(
      `
      SELECT id
      FROM developers
      WHERE id = $1;
      `,
      [developerId],
    );

    if (existingDeveloper.rows.length === 0) {
      return res.status(404).send("Developer not found");
    }

    await db.query(
      `
      DELETE FROM game_developers
      WHERE developer_id = $1;
      `,
      [developerId],
    );

    await db.query(
      `
      DELETE FROM developers
      WHERE id = $1;
      `,
      [developerId],
    );

    res.redirect("/developers");
  } catch (err) {
    next(err);
  }
};
