const fs = require('fs');

var token = {};

token.addToken = function (req,res) {
    const newToken = {'company':req.body.company,'token':req.body.token};
    try {
        const tokenArray = JSON.parse(fs.readdirSync('../config','utf8'));
        tokenArray.push(newToken);
        fs.writeFileSync('../config',JSON.stringify(tokenArray),'utf8');
    }
    catch (e) {
        res.status(404).send();
    }
};


module.exports = token;