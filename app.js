const express =  require('express');
var bodyParser = require('body-parser');
var token = require('./src/model/token');

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
    res.render('add');
});

app.post('/addToken',function (req,res) {
    res.status(200).send();
    return;
    token.addToken(req,res);
});


app.listen(port, function(){
    console.log('Server is running on port:', port);
});