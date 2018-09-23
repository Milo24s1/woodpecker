const fs = require('fs');
const Company = require('../../model/company');

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


token.addTokenToDatabase = function(req,res){
    
    try {
       const newCompany = Company({'companyName':req.body.company,'token':req.body.token});
       Company.addCompany(newCompany,function (err,company) {

           if(err){
               console.log(err);
               res.status(400).send();
           }
           else {
               res.status(200).send();
           }
       });
    }
    catch (e) {
        console.log(e);
        res.status(400).send();
    }

};

token.readToken = function(){
    return JSON.parse(fs.readFileSync('config.txt','utf8')).data.sort(function(a, b) {
        return compareStrings(a.company, b.company);
    });
};

token.readTokenFromDatabase = function(req, res){
    Company.getCompanyList(function (err,result) {
        console.log('callback is called');
        if(err){
            console.log(err);
            res.render('add',{'itms':[]});
        }
        else {
            res.render('add',{'itms':result});

        }
    });
};

token.deleteToken = function(req,res){
    console.log(req.params.id);
    const data =JSON.parse(fs.readFileSync('config.txt','utf8')).data;
    const removed =data.splice(req.params.id,1);
    fs.writeFileSync('config.txt',JSON.stringify({"data":data}),'utf8');
    res.redirect('/add');

};

token.deleteTokenFromDatabase = function (req,res) {
  Company.deleteCompany(req.params.id,function (err,data) {
      res.redirect('/add');
  });
};
function compareStrings(a, b) {
    // Assuming you want case-insensitive comparison
    a = a.toLowerCase();
    b = b.toLowerCase();

    return (a < b) ? -1 : (a > b) ? 1 : 0;
}

module.exports = token;