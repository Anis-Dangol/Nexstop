import express from "express";
import {
  addFavourite,
  getFavourites,
  removeFavouriteById,
  removeFavouriteByLocations,
  getFavouriteById,
  updateFavourite,
} from "../../controllers/auth/favourite-controller.js";

const router = express.Router();

router.post("/add-favourite", addFavourite);
router.get("/get-favourites/:userId", getFavourites);
router.delete("/remove-favourite/:routeId", removeFavouriteById);
router.post("/remove-favourite", removeFavouriteByLocations);
router.get("/get-favourite/:routeId", getFavouriteById);
router.put("/update-favourite/:routeId", updateFavourite);

export default router;
