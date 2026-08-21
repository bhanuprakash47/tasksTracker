import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import "dotenv/config"
import express from "express"
import cors from "cors"
import mongoose from "mongoose"

import authRoutes from "./routes/authRoutes.js"
import taskRoutes from "./routes/taskRoutes.js"

const app=express()
app.use(cors())
app.use(express.json())

app.use("/api/auth",authRoutes)
app.use("/api/tasks",taskRoutes)

const MONGO_URL=process.env.MONGO_URL
const PORT =process.env.PORT || 5000

const initializeServerAndDB=async()=>{
    try{
        await mongoose.connect(MONGO_URL).then(()=>{
            console.log("DB connected")
        })

        app.listen(PORT,()=>{
            console.log("server is running on port",PORT)
        })
    }catch(err){
        console.error("Server failed to start",err.message)
        process.exit(1)
    }
}

initializeServerAndDB()