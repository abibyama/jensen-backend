const auditLog = require ("audit-log");
const credentials = {secretUser:"user" , secretPassword:"password"}

const cors = require("cors");
const express = require("express");
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const mongoose = require ("mongoose");
const https = require ('https');
const http = require('http');
const fs = require('fs');
const app = express()
const PORT = process.env.PORT || 3000

var options = {
   key: fs.readFileSync('abels-key.pem'),
   cert: fs.readFileSync('abels-cert.pem')
};

auditLog.addTransport("mongoose", {connectionString: "mongodb://localhost:27017/myDatabase"});
auditLog.addTransport("console");
// descriptive parameters for your reading pleasure:
auditLog.logEvent('user id or something', 'maybe script name or function', 'what just happened', 'the affected target name perhaps', 'target id', 'additional info, JSON, etc.');
 
// a more realistic example:
auditLog.logEvent(95049, 'AppServer', 'Shutdown', 'Production-3 Instance', 'ec2-255-255-255-255', 'Terminated from web console.');


app.use(function (req, res, next) {
   res.setHeader('Content-Security-Policy', "default-src 'self'; font-src 'self'; img-src 'self'; script-src 'self'; style-src 'self'; frame-src 'self'");
   next();
});

app.use('/healthcheck', require('./routes/healthcheck.routes'));

app.use(express.urlencoded({ extended: true }));
app.use(cors())

app.get("/", (req ,res)=>{
   headers={"http_status":200, "cache-control":  "no-cache"}
   body={"status": "available"}
   res.status(200).send(body)
})

app.get("/health", (req ,res)=>{
   headers={"http_status":200, "cache-control":  "no-cache"}
   body={"status": "available"}
   res.status(200).send(body)
})


app.post('/authorize', (req, res) => {
   // Insert Login Code Here
   let user = req.body.user;
   let password = req.body.password;
   console.log(`User ${user}`)
   console.log(`Password ${password}`)

   if(user===credentials.secretUser && password===credentials.secretPassword){
      console.log("Authorized")
      const token = jwt.sign({
            data: 'foobar'
      }, 'your-secret-key-here', { expiresIn: 60 * 60 }); 

      console.log(token)
      res.status(200).send(token)
  }else{
      console.log("Not authorized")
      res.status(200).send({"STATUS":"FAILURE"})
   }
});

app.listen(PORT , ()=>{
     console.log(`STARTED LISTENING ON PORT ${PORT}`)
});

https.createServer(options, app).listen(443, function(){
      console.log('HTTPS LISTENING ON 443');
})
