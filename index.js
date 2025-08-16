const express= require('express');
const cors = require('cors');
const userRoutes=require('./routes/userRoutes')
const authRoutes=require('./routes/authRoutes')
const courseRoutes=require('./routes/courseRoutes')
const mongooseConnection=require('./config/database')
const app=express();
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
mongooseConnection();
app.use('/api/users',userRoutes);
app.use('/api/auth',authRoutes);
app.use('/api/courses',courseRoutes)
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