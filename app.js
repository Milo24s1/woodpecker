const express =  require('express');
var bodyParser = require('body-parser');
var token = require('./src/model/token');
var woodpeker = require('./src/model/woodpeker');

const app = express();
const port = process.env.PORT || 9999;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');


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


app.listen(port, function(){
    console.log('Server is running on port:', port);
});