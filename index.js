const express = require('express');
const app = express();
const multer = require('multer');
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true})); 
const mysql = require('mysql');
const { error } = require('console');
const port = process.env.PORT | 5004;

app.use(express.static('frontend'));
app.get('/',(req,res)=>{
    res.sendFile(__dirname + "index.html");
})

var con = mysql.createConnection({
    host:'localhost',
    port:'3306',
    user:'root',
    password:'',
    database:'demo'

});
con.connect(function(err){
   if(err) throw error;
   console.log("connected successfully!");
})


const storage = multer.memoryStorage();
const upload = multer({storage : storage});
app.post('/upload',upload.single('image'),(req,res)=>{
    if(!req.file){
        return res.status(400).send('No file uploaded');
    }
    const imageData = req.file.buffer;
    const image = {
        name : req.file.originalname,
        images: imageData,
    };
    con.query('INSERT into image SET ?',image,(err, result)=>{
        if(err){
            console.error('Error storing the image in the database:',err);
            res.status(500).send('Error storing the image in the database.');
        }else{
            res.send('Image uploaded and stored successfully to the database');
        }
    })
})

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.get('/image/:id',(req,res)=>{
    const imageId = req.params.id;
    con.query('SELECT images from image WHERE id=?',[imageId],(err,results)=>{
        if(err){
            console.error('Error retrieving the image data from the database:',err);
            res.status(500).send('Error retrieving the image data from the database.');
        } else{
            if(results.length==0){
                res.status(404).send('The requested image does not exist.')
            }else{
                res.render('image',{imageData:results[0].images.toString('base64')});
            }
        }
    })
})

app.listen(port , ()=>{
    console.log(`Now running on http://localhost:${port}`);
})