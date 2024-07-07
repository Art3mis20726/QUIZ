import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { quesUpload } from "../controllers/ques.controlles.js";
const router=Router()
router.route("/postQuestion").post(verifyJWT,quesUpload)
// router.route("/getQuestion").post(verifyJWT,randomQuestion)
export default router