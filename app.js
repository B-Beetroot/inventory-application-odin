const express = require("express");
const expressLayouts = require("express-ejs-layouts");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const gameRouter = require("./routes/gameRouter");
const genreRouter = require("./routes/genreRouter");
const developerRouter = require("./routes/developerRouter");

app.set("view engine", "ejs");
app.set("layout", "layout");

app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index", {
    title: "Game Inventory",
  });
});

app.use("/games", gameRouter);
app.use("/genres", genreRouter);
app.use("/developers", developerRouter);

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).send("Something went wrong");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
