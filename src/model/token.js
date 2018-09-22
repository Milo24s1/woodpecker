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
    return JSON.parse(fs.readFileSync('config.txt','utf8')).data.sort(function(a, b) {
        return compareStrings(a.company, b.company);
    });
};

token.deleteToken = function(req,res){
    console.log(req.params.id);
    const data =JSON.parse(fs.readFileSync('config.txt','utf8')).data;
    const removed =data.splice(req.params.id,1);
    fs.writeFileSync('config.txt',JSON.stringify({"data":data}),'utf8');
    res.redirect('/add');

};
function compareStrings(a, b) {
    // Assuming you want case-insensitive comparison
    a = a.toLowerCase();
    b = b.toLowerCase();

    return (a < b) ? -1 : (a > b) ? 1 : 0;
}

module.exports = token;