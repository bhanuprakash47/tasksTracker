import Task from "../models/Task.js"

export const createTask=async(req,res)=>{
    const userId=req.user.userId
    const { title, description, status, priority, dueDate } = req.body;
    
    try{
        if(!title || !description || !status || !priority){
            return res.status(400).json({error:"required all tasks fields:[title,description,status,priority]"})   
        }

        const existingTask= await Task.findOne({
            title:title,
            user:userId
        })

        if(existingTask){
            return res.status(409).json({error:"task with same title for this user exists"})
        }

        const newTask= new Task({
            title,
            description,
            status,
            priority,
            dueDate,
            user:userId
        })
        const savedTask = await newTask.save()

        res.status(201).json({
            message:"task created successfully.",
            task:savedTask
        })
        

    }catch(err){
        console.log('failed to create a new task',err)
        res.status(500).json({error:"Failed to create task, server error",err})
    }
}


export const getAllTasks = async (req, res) => {
    const userId = req.user.userId;

    const {
        title,
        status,
        priority,
        sort,
        page = 1,
        limit = 10
    } = req.query;

    try {
        const filterObj = {
            user: userId
        };

        if (title) {
            filterObj.title = title;
        }

        if (status) {
            filterObj.status = status;
        }

        if (priority) {
            filterObj.priority = priority;
        }

        const pageNumber = Math.max(Number(page) || 1, 1);
        const limitNumber = Math.min(Math.max(Number(limit) || 10, 1), 100);
        const skip = (pageNumber - 1) * limitNumber;

        let tasks;

        
        if (sort === "priority" || sort === "-priority") {
            const priorityDirection = sort === "priority" ? 1 : -1;

            tasks = await Task.aggregate([
                { $match: filterObj },

                {
                    $addFields: {
                        priorityOrder: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ["$priority", "HIGH"] }, then: 1 },
                                    { case: { $eq: ["$priority", "MEDIUM"] }, then: 2 },
                                    { case: { $eq: ["$priority", "LOW"] }, then: 3 }
                                ],
                                default: 4
                            }
                        }
                    }
                },

                { $sort: { priorityOrder: priorityDirection } },

                { $skip: skip },
                { $limit: limitNumber },

                { $project: { priorityOrder: 0 } }
            ]);
        } else {
            const sortObj = {};

            if (sort === "dueDate") {
                sortObj.dueDate = 1;
            } else if (sort === "-dueDate") {
                sortObj.dueDate = -1;
            } else {
                sortObj.createdAt = -1;
            }

            tasks = await Task.find(filterObj)
                .sort(sortObj)
                .skip(skip)
                .limit(limitNumber);
        }

        if (tasks.length === 0) {
            return res.status(404).json({
                error: "No tasks found"
            });
        }

        const totalTasks = await Task.countDocuments(filterObj);

        return res.status(200).json({
            tasksList: tasks,
            pagination: {
                currentPage: pageNumber,
                limit: limitNumber,
                totalTasks,
                totalPages: Math.ceil(totalTasks / limitNumber)
            }
        });

    } catch (err) {
        console.log("Get all tasks error", err);

        return res.status(500).json({
            error: "Failed to get all tasks, server error"
        });
    }
};

export const getTaskById= async(req,res)=>{
    const userId=req.user.userId
    const taskId= req.params.id
    try{
        const task= await Task.findOne({
            user:userId,
            _id:taskId
        })

        if(!task){
            return res.status(404).json({error:"requested task not found"})
        }

        res.status(200).json({task})

    }catch(err){
        console.log("Failed to get task",err)
        res.status(500).json({error:"failed to get task server error",err})
    }
}

export const updateTask= async(req,res)=>{
    const userId=req.user.userId
    const {title,description,status,priority,dueDate}=req.body
    const taskId=req.params.id
    try{
        const task= await Task.findOne({
            _id:taskId,
            user:userId
        })

        if(!task){
            return res.status(404).json({error:"task not found"})
        }

        const updatedTask= await Task.findByIdAndUpdate(
            taskId,
            {
                title:title ?? task.title,
                description:description ?? task.description,
                status: status ?? task.status,
                priority: priority ?? task.priority,
                dueDate: dueDate ?? task.dueDate
            },
            {new:true,runValidators:true}
        )

        res.status(200).json({
            message:"task updated succesfully",
            task:updatedTask
        })

    }catch(err){
        console.log("failed to update task",err)
        res.status(500).json({error:"failed to update task server error",err})
    }
}

export const deleteTask = async (req, res) => {
    const userId = req.user.userId;
    const taskId = req.params.id;

    try {
        const deletedTask = await Task.findOneAndDelete({
            _id: taskId,
            user: userId
        });

        if (!deletedTask) {
            return res.status(404).json({
                error: "No task found"
            });
        }

        return res.status(200).json({
            message: "Task deleted successfully"
        });

    } catch (err) {
        console.log("Delete task error", err);

        return res.status(500).json({
            error: "Task deletion failed, server error"
        });
    }
};

