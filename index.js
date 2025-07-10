const express= require('express');
const app=express();
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