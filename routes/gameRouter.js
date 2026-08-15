const router = require("express").Router();
const gameController = require("../controllers/gameController");

router.get("/", gameController.game_list);

router.get("/create", gameController.game_create_get);
router.post("/create", gameController.game_create_post);

router.get("/:id/update", gameController.game_update_get);
router.post("/:id/update", gameController.game_update_post);

router.post("/:id/delete", gameController.game_delete_post);

router.get("/:id", gameController.game_detail);

module.exports = router;
