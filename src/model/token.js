const fs = require('fs');

var token = {};

token.addToken = function (req,res) {
    const newToken = {'company':req.body.company,'token':req.body.token};
    try {
        const tokenArray = JSON.parse(fs.readFileSync('config.txt','utf8')).data;
        tokenArray.push(newToken);
        fs.writeFileSync('config.txt',JSON.stringify({"data":tokenArray}),'utf8');
        res.status(200).send();
    }
    catch (e) {
        res.status(404).send();
    }
};

token.readToken = function(){
    return JSON.parse(fs.readFileSync('config.txt','utf8')).data;
};

token.deleteToken = function(req,res){
    console.log(req.params.id);
    const data =JSON.parse(fs.readFileSync('config.txt','utf8')).data;
    const removed =data.splice(req.params.id,1);
    console.log(removed);
    console.log(data);
    fs.writeFileSync('config.txt',JSON.stringify({"data":data}),'utf8');
    res.redirect('/add');

};


module.exports = token;