
import app from "./server.js"
import axios from "axios";
import db from "./dbconfig.js"
import {initialize} from "./passportConfig.js";
import bcrypt, { hash } from "bcrypt";
import session from "express-session";
import flash from "express-flash";
import passport from "passport";
import Razorpay from "razorpay";
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

let subscription;
let emailuser;
let user_name;
let logincheck=false;
//middelwares
initialize(passport);

var razorpayInstance = new Razorpay({
    key_id:process.env.RAZORPAY_ID_KEY ,
    key_secret:process.env.RAZORPAY_SECRET_KEY
});




app.use(session(
    {
        secret:'secret',
        resave:false,
        saveUninitialized:false,

    }
));

app.use(passport.initialize());

app.use(passport.session())

app.use(flash())


//  handeling all the get request
app.get("/",(req,res)=>{
    res.render("index.ejs");
})

app.get("/disease_detection",checkNotAuthenticated,isFree,(req,res)=>{
    res.render("disease_detection.ejs",{
        subscription:req.user.subscription
       
    });
})

app.get("/pricing",isloggedin,(req,res)=>{
    try {
        res.render('pricing.ejs',{
            key_id:process.env.RAZORPAY_ID_KEY,
            logincheck,
        subscription,
        });
    } catch (error) {
        console.log(error.message);
    }
   
    
})

app.get("/aboutUs",(req,res)=>{
    res.render("aboutUs.ejs") ;
})

app.get("/login",checkAuthenticated,(req,res)=>{
    res.render("login.ejs");
   
})

app.get("/register",checkAuthenticated,(req,res)=>{
    res.render("register.ejs");
})

app.get("/profile",checkNotAuthenticated,function(req, res) {
    res.render("profile.ejs"),{
        user:req.user.name
    }; // Render the profile.ejs file
});

app.get("/dashboard", checkNotAuthenticated ,(req,res)=>{
    subscription=req.user.subscription
    emailuser=req.user.email
    user_name=req.user.name
   
    
    
    res.render("dashboard.ejs",{
        user:req.user.name,
        subscription
    })
})



app.get("/logout",(req,res)=>{
    req.logOut((err)=>{
        if(err){
            throw err;
        }
        req.flash("success_msg","Successfully Logged Out");
        logincheck=false;
    res.redirect("/login");
    

    }); 
    
    
})
 
app.get("/free",checkNotAuthenticated,(req,res)=>{

    //code for payment interface on succcessfull payent this query will be executed
    db.query( 
        `UPDATE users
        SET subscription = 'Free'
        WHERE email = $1;`,[emailuser],(err,result)=>{
            if(err){
                throw err;
            }
            console.log(result.rows);
        });

    //after payment and above process theis will get exeued
    res.redirect("/dashboard")
        
})

app.get("/standerd",checkNotAuthenticated,(req,res)=>{

    //code for payment interface on succcessfull payent this query will be executed
    // db.query( 
    //     `UPDATE users
    //     SET subscription = 'Standard'
    //     WHERE email = $1;`,[emailuser],(err,result)=>{
    //         if(err){
    //             throw err;
    //         }
    //         console.log(result.rows);
    //     });

    //after payment and above process theis will get exeued
    res.redirect("/dashboard")
        
})
app.get("/premium",checkNotAuthenticated,(req,res)=>{

    //code for payment interface on succcessfull payent this query will be executed
    // db.query( 
    //     `UPDATE users
    //     SET subscription = 'Premium'
    //     WHERE email = $1;`,[emailuser],(err,result)=>{
    //         if(err){
    //             throw err;
    //         }h
    //         console.log(result.rows);});

    //after payment and above process theis will get exeued
    res.redirect("/dashboard")
        
})
//chat gpt integration 
app.get('/api/chat', async (req, res) => {
    try {
        const message = req.query.message;
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'system', content: 'You are a helpful assistant.' }, { role: 'user', content: message }],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPEN_API_TOKEN}`, // Replace with your OpenAI API key
                },
            }
        );

        res.json({ message: response.data.choices[0].message.content });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/device",checkNotAuthenticated,(req,res)=>{
res.render("device.ejs",{
    subscription
})
})

app.get("/community",checkNotAuthenticated,(req,res)=>{
    res.render("community/community.ejs",{
        subscription,
    });
})

// handeling the post request for register page

// razor pay rder creation

app.post('/createOrder', async (req, res) => {
    try {
        const amount = req.body.amount * 100;
        const options = {
            amount: amount,
            currency: 'INR',
            receipt: 'razorUser@gmail.com'
        };

        razorpayInstance.orders.create(options, async (err, order) => {
            if (!err) {
                // Update user's subscription in the database after successful payment
                await db.query(
                    `UPDATE users
                    SET subscription = $1
                    WHERE email = $2;`,
                    [req.body.name, req.user.email]
                );

                res.status(200).send({
                    success: true,
                    msg: 'Order Created',
                    order_id: order.id,
                    amount: amount,
                    key_id: RAZORPAY_ID_KEY,
                    product_name: req.body.name,
                    description: req.body.description,
                    contact: '8567340632',
                    name: user_name,
                    email: emailuser
                });
            } else {
                res.status(400).send({ success: false, msg: 'Something went wrong!' });
            }
        });
    } catch (error) {
        console.log(error.message);
    }
});

// ...


app.post("/registerform",async (req,res)=>{
    let {name, email ,password ,passwordconfirm}= req.body
    let error=[];
    if(password!==passwordconfirm){
        error.push({message:"The password Dosen't Match "})
        // error=[];
        
    }
   

    if(error.length>0){
        res.render("register.ejs",{
            error
        })
    }
    else{
        // form validation has passed
        let hashedpassword = await bcrypt.hash(password,10)
        console.log(hashedpassword);

       

        db.query(
            `select * from users
            where email=$1 `,[email],(err,result)=>{
                if(err){
                    throw err;
                }
                // console.log(result.rows);

                if(result.rows.length>0){
                    error.push({message:"Email already register"})
                    res.render("register.ejs",{error});
                }
                else{
                    db.query(`INSERT INTO users (name,email,password)
                    VALUES ($1,$2,$3) returning id,password`,[name,email,hashedpassword],(err,result)=>{
                        if(err){
                            throw err
                        }
                        else{
                            // console.log(result.rows);
                            req.flash("success_msg","Successfully registered please login");
                            res.redirect("/login")
                        }
                    })
                }
            }
        );
    }
})


app.post("/login",passport.authenticate("local",{
    successRedirect:"/dashboard",
    failureRedirect:"/login",
    failureFlash:true
}))

//chat gpt integration 
app.get('/api/chat', async (req, res) => {
    try {
        const message = req.query.message;
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'system', content: 'You are a helpful assistant.' }, { role: 'user', content: message }],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPEN_API_TOKEN}`, // Replace with your OpenAI API key
                },
            }
        );

        res.json({ message: response.data.choices[0].message.content });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Function for authentication session
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
   
      return res.redirect("/dashboard");
      
    }
    
   
    next();
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    
    
    res.redirect("/login");
  }
  

  function isFree(req,res,next){
    subscription=req.user.subscription
    if(subscription=="Free"){
        return res.redirect("/dashboard");
    }
    next();
  }

  function isloggedin(req, res, next) {
    // subscription=req.user.subscription
    if (req.isAuthenticated()) {
      logincheck=true;
    }
    next();
    
    }







