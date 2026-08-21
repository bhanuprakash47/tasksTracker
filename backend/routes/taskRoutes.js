import express from "express"

import verifyToken from "../middlewares/auth.middleware.js"
import { getAllTasks,getTaskById,createTask,updateTask,deleteTask } from "../controllers/task.controller.js"

const router=express.Router()

router.get("/",verifyToken,getAllTasks)
router.get("/:id",verifyToken,getTaskById)
router.post("/",verifyToken,createTask)
router.put("/:id",verifyToken,updateTask)
router.delete("/:id",verifyToken,deleteTask)


export default router