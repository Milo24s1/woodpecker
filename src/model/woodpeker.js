const Woodpecker = require('woodpecker-api');
const fs = require('fs');

const companyToken = '32755.a724decf926ed2aeaf513b08e38fec37e415a6dd07e32869a3d71a4906f70e27';

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
                    console.log(item.name);
                    const row = {
                        'company':company,
                        'campaign':item.name,
                        'delivered': item.stats.delivery,
                        'opened':item.stats.opened,
                        'responses':item.stats.replied,
                        'prospects':item.stats.prospects

                    };
                    rowData.push(row);
                }

                console.log(rowData);
                resolve(rowData) ;

            })
                .catch(e=>{
                    console.log(e);
            });


        }).catch(e=>{

        });
    });



}

async function getNextResultSet(token,res) {
    let {hashArray, tokenArray}= getTokenCompanyMap();
    if(token==undefined){
        token = tokenArray[0];
    }
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
    JSON.parse(fs.readFileSync('config.txt'),'utf8').data.map(o=> {
        hashArray[o.token]=o.company;
        tokenArray.push(o.token);
    });
    return {'hashArray':hashArray,'tokenArray':tokenArray};
}

//searchCompanyCampaigns(companyToken);

var woodpeker = {};
woodpeker.search = function(req,res){
        getNextResultSet(req.body.next,res);

};
module.exports = woodpeker;
