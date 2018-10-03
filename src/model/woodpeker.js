const Woodpecker = require('woodpecker-api');
const fs = require('fs');
const Company = require('../../model/company');
const CampaignRecord = require('../../model/campaignRecord');


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

                const rowData = [];

                for (let item of values){
                    item =item[0];
                    if(item.status != 'DELETED'){
                        const row = {
                            'company':company,
                            'token':companyToken,
                            'campaign':item.name,
                            'campaignId':item.id,
                            'delivered': item.stats.delivery,
                            'status': item.status,
                            'deliveredPrecentage': Math.floor(100*item.stats.delivery/item.stats.prospects),
                            'opened':item.stats.opened,
                            'openedPrecentage':Math.floor(100*item.stats.opened/item.stats.delivery),
                            'responses':item.stats.replied,
                            'responsesPrecentage':Math.floor(100*item.stats.replied/item.stats.delivery),
                            'prospects':item.stats.prospects,
                            'cus1':'',
                            'cus2':'',
                            'cus3':'',


                        };
                        rowData.push(row);
                    }

                }

                CampaignRecord.getCampaignRecordsByToken(companyToken,function (err,data) {
                    const campRecord = {};
                    if(err){
                        console.log(err);
                    }
                    else {
                        data.map(o=>{
                            campRecord[o.campId]= o;
                        });

                        resolve({'rowData':rowData,'campRecord':campRecord}) ;
                    }
                });


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
    let {hashArray, tokenArray}= await getTokenCompanyMapFromDatabase();
    if(token==undefined){
        token = tokenArray[0];
    }
    const {rowData,campRecord} = await searchCompanyCampaigns(token,hashArray[token]);
    const nextToken = tokenArray[tokenArray.indexOf(token)+1];

    res.send({'next':nextToken,'rowData':rowData, 'campRecord':campRecord});


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

function getTokenCompanyMapFromDatabase() {
    let hashArray = [];
    let tokenArray = [];

    return new Promise(function (resolve,reject) {
        Company.getCompanyList(function (err,data) {
            if(err){
                console.log(err);
            }
            else{
                data.map(o=> {
                    hashArray[o.token]=o.companyName;
                    tokenArray.push(o.token);
                });
            }
            resolve({'hashArray':hashArray,'tokenArray':tokenArray});
        })

    });


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


woodpeker.saveCampaignRecord = function(req,res){

    CampaignRecord.getCampaignRecordByCampaignId(req.body.campId,function (err,data) {

        if(err){
            res.status(400).send({err});
        }
        else {
            if(data.length>0){
                //update record
                CampaignRecord.update({ campId: req.body.campId }, {
                    $set: { customCol1: req.body.customCol1,
                            customCol2: req.body.customCol2,
                            customCol3: req.body.customCol3}}, function (err,data) {
                                if(err){
                                    res.status(400).send({err});
                                }
                                else{
                                    res.status(200).send({'message':'Data Updated Successfully'})
                                }
                });
            }
            else{
                //add new record
                const campaignRecord = new CampaignRecord({
                    token : req.body.token,
                    customCol1: req.body.customCol1,
                    customCol2: req.body.customCol2,
                    customCol3: req.body.customCol3,
                    campId: req.body.campId
                });

                CampaignRecord.addCampaignRecord(campaignRecord,function (err,data) {
                    if(err){
                        res.status(400).send({err});
                    }
                    else{
                        res.status(200).send({'message':'Data Saved Successfully'});
                    }
                })
            }

        }
    });




};
module.exports = woodpeker;
