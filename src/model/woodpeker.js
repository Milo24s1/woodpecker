const Woodpecker = require('woodpecker-api');
const fs = require('fs');


function searchCompanyCampaigns(companyToken,company) {

    return new Promise(function (resolve,reject) {
        const WoodpeckerAPI = Woodpecker(companyToken);
        WoodpeckerAPI.campaigns().find().
        then((list)=>{
            let companyPromiseArray = [];
            let id =0;
            for (let campaign of list){
                companyPromiseArray.push(WoodpeckerAPI.campaigns().find({ids:campaign.id}));
            }
            Promise.all(companyPromiseArray)
                .then(values=>{

                console.log('Im going print this after all data loaded');
                const rowData = [];

                for (let item of values){
                    item =item[0];
                    if(item.status != 'DELETED'){
                        const row = {
                            'company':company,
                            'campaign':item.name,
                            'delivered': item.stats.delivery,
                            'status': item.status,
                            'deliveredPrecentage': Math.floor(100*item.stats.delivery/item.stats.prospects),
                            'opened':item.stats.opened,
                            'openedPrecentage':Math.floor(100*item.stats.opened/item.stats.delivery),
                            'responses':item.stats.replied,
                            'responsesPrecentage':Math.floor(100*item.stats.replied/item.stats.delivery),
                            'prospects':item.stats.prospects

                        };
                        rowData.push(row);
                    }

                }

                resolve(rowData) ;

            })
                .catch(e=>{
                    console.log(e);
                    resolve([]);
            });


        }).
        catch(e=>{
            console.log(e);
            resolve([]);
        });
    });



}

async function getNextResultSet(token,res) {
    let {hashArray, tokenArray}= getTokenCompanyMap();
    if(token==undefined){
        token = tokenArray[0];
    }
    console.log(token,hashArray[token]);
    const rowData = await searchCompanyCampaigns(token,hashArray[token]);
    console.log('this is called after');
    const nextToken = tokenArray[tokenArray.indexOf(token)+1];

    res.send({'next':nextToken,'rowData':rowData});


}

function searchAllCampaigns() {
    const  data = [];
    let promiseArray = [];
    let tokenList = getTokenCompanyMap();
    for (let token in tokenList){
        promiseArray.push(searchCompanyCampaigns(token));
        console.log('should first');
    }


    // return Promise.all(promiseArray).then(campaigns=>{
    //     campaigns.forEach(campaign=>{
    //         console.log(campaign);
    //     });
    // })
}

function getTokenCompanyMap() {
    let hashArray = [];
    let tokenArray = [];
    JSON.parse(fs.readFileSync('config.txt'),'utf8').data.sort(function(a, b) {
        return compareStrings(a.company, b.company);
    }).map(o=> {
        hashArray[o.token]=o.company;
        tokenArray.push(o.token);
    });
    return {'hashArray':hashArray,'tokenArray':tokenArray};
}


function compareStrings(a, b) {
    // Assuming you want case-insensitive comparison
    a = a.toLowerCase();
    b = b.toLowerCase();

    return (a < b) ? -1 : (a > b) ? 1 : 0;
}


var woodpeker = {};
woodpeker.search = function(req,res){
        getNextResultSet(req.body.next,res);

};
module.exports = woodpeker;
