import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
const app = express();
dotenv.config();
const port =process.env.SERVER_PORT


// middelwares i required
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(port,()=>{
    console.log(`http://127.0.0.1:${port}/`);
})

export default app;