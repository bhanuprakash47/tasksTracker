import mongoose from "mongoose";

const taskSchema= new mongoose.Schema(
    {
        title:{
            type:String,
            required:true,
            trim:true
        },
        
        description:{
            type:String,
            required:true,
        },
        status:{
            type:String,
            required:true,
            enum:["Todo","In Progress","Done"],
            default:"Todo"
        },
        priority:{
            type:String,
            required:true,
            enum:["LOW","MEDIUM","HIGH"],
        },
        dueDate:{
            type:Date,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps:true
    }
)

const Task = mongoose.model("Task",taskSchema)

export default Task