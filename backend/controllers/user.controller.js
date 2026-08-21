import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

import User from "../models/User.js"

const jwt_secret_key=process.env.jwt_secret_key 

export const register=async(req,res)=>{
    const {email,name,password}=req.body
    try{
        if(!email || !name || !password){
            return res.status(400).json({error:"required all fields"})
        }

        const existing= await User.findOne({email})

        if(existing){
            return res.status(409).json({error:"user already exists"})
        }

        const hashedPassword= await bcrypt.hash(password,10)

        const user= new User({name,email,password:hashedPassword})

        const savedUser= await user.save()

        if(savedUser){
            const jwtToken=  jwt.sign(
                {userId:savedUser._id,email:savedUser.email},
                jwt_secret_key,
                {expiresIn:"30d"}
            )
            return res.status(201).json({user:{
                id:savedUser._id,
                name:savedUser.name,
                email:savedUser.email
            },token:jwtToken})
        }
    }
    catch(err){
        console.log("registration error",err)
        res.status(500).json({error:'Registration server error',err})
    }
}

export const login= async(req,res)=>{
    const {email,password}=req.body
    try{

        if(!email || !password){
            return res.status(400).json({error:"required all fields"})
        }

        const isUserExists= await User.findOne({email})

        if(!isUserExists){
            return res.status(404).json({error:"User not found"})
        }

        const comparePassword= await bcrypt.compare(password,isUserExists.password)

        if(!comparePassword){
            return res.status(403).json({error:"invalid credentials"})
        }

        const jwtToken=  jwt.sign(        
            {userId:isUserExists._id,email:isUserExists.email},
            jwt_secret_key,
            {expiresIn:"30d"}
        )

        res.status(200).json({token:jwtToken})
    }   
    catch(err){
        console.log("login error",err)
        res.status(500).json({error:"Login server error",err})
    }
}