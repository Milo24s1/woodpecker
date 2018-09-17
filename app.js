const express =  require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var token = require('./src/model/token');
var woodpeker = require('./src/model/woodpeker');
var woodpeckMailer = require('./src/model/woodpeckMailer');
const auth = require('basic-auth');

const app = express();
const port = process.env.PORT || 49152;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

app.use('/add',(req,res,next)=>{
    var user = auth(req);

    if(user==undefined){
        res.set({
            'WWW-Authenticate': 'Basic realm="simple-admin"'
        }).sendStatus(401);
    }

    const savedUser = JSON.parse(fs.readFileSync('user.txt'));
    if (user.pass == savedUser.password && user.name ==savedUser.username){
        next();
    }
    else{
        res.set({
            'WWW-Authenticate': 'Basic realm="simple-admin"'
        }).sendStatus(401);
    }

});

app.get('/', function(req, res){
    console.log('get req came');
    res.render('index');
});
app.get('/add', function(req, res){
    console.log('get req came');
    res.render('add',{itms: token.readToken()});
});

app.post('/addToken',function (req,res) {
    token.addToken(req,res);
});
app.get('/deleteToken/:id',function (req,res) {
    token.deleteToken(req,res);
});

app.post('/search',function (req,res) {
    woodpeker.search(req,res);
});

app.post('/sendEmail',function (req,res) {
    woodpeckMailer.sendMail(req,res);
});


app.listen(port, function(){
    console.log('Server is running on port:', port);
});