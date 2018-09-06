const express =  require('express');
var bodyParser = require('body-parser');
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


app.listen(port, function(){
    console.log('Server is running on port:', port);
});