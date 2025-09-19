const express=require("express")
// const confiDb=require("./db/configDb")
const connectDB=require("./db/configDb")
const dotenv=require("dotenv");
const colors=require("colors");
const cors=require("cors");
// const User=require("./db/models/userSchemaDef")
const User=require("./db/models/userSchemaDefined")
//configure env
dotenv.config();
//database config
connectDB()
//rest object
const app=express();
//middleware
app.use(express.json())

app.use(cors())
// Routing and api's connecting Here
app.post("/userregister", async(req, resp)=>{
    let user=new User(req.body)
    let result= await user.save()
//    resp.send("api is progress")
   resp.send(result)
})

//run listen
const PORT = process.env.PORT || 4500;
app.listen(PORT, ()=>{
    console.log(`server running on ${process.env.DEV_NODE} mode on port ${PORT}`.bgCyan.white);
});


