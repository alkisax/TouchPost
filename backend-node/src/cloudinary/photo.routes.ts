import { Router } from "express";
import { getPhotos } from "./photo.controller";


const router = Router();

router.get("/", getPhotos)

export default router