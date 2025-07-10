const express= require('express');
const userRoutes=require('./routes/userRoutes')
const mongooseConnection=require('./config/database')
const app=express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
mongooseConnection();
app.use('/api/users',userRoutes);
app.use('/api/health',(req,res)=>{
    res.status(200).json({
        status:"ok",
        message:"LMS Server is Running"
    })
})
const PORT=3001;
app.listen(PORT,()=>{
    console.log(`LMS BE listining on Port ${PORT}`)
})
module.exports = app;