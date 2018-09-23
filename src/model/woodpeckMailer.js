const woodpeckMailer = {};
const nodemailer = require('nodemailer');
const Woodpecker = require('woodpecker-api');
const fs = require('fs');
const config = require('../../config/credintials');
const Company = require('../../model/company');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: config.emailUsername, // generated ethereal user
        pass: config.emailPassword // generated ethereal password
    }
});

woodpeckMailer.sendMail = async function(req,res){
    res.send({});

    const token = req.body.token;
    const receivers = req.body.emailAddressList;
    let {hashArray, tokenArray}= await getTokenCompanyMapFromDatabase();

    const clientName = hashArray[token];
    const rowData = await searchCompanyCampaigns(token,hashArray[token]);
    const html = getEmailBody(rowData);


    let mailOptions = {
        from: '"Matt" <matt@getprospectgenai.com>', // sender address
        to: receivers.join(','), // list of receivers
        subject: `ProspectGen AI: ${clientName} Weekly Report Snapshot`, // Subject line
        // text: 'Hello world?', // plain text body
        html: html // html body
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });

};



function getTokenCompanyMap() {
    let hashArray = [];
    let tokenArray = [];
    JSON.parse(fs.readFileSync('config.txt'),'utf8').data.map(o=> {
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
            console.log(data[0]);
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

                    console.log('data recieved');
                    const rowData = [];

                    for (let item of values){
                        item =item[0];

                        if(item.status != 'DELETED' ){
                            const row = {
                                'company':company,
                                'date': item.created,
                                'campaign':item.name,
                                'delivered': item.stats.delivery,
                                'status': item.status,
                                'deliveredPrecentage': isNaN(Math.floor(100*item.stats.delivery/item.stats.prospects)) ? 0:Math.floor(100*item.stats.delivery/item.stats.prospects),
                                'opened':item.stats.opened,
                                'openedPrecentage': isNaN(Math.floor(100*item.stats.opened/item.stats.delivery))? 0 :Math.floor(100*item.stats.opened/item.stats.delivery),
                                'responses':item.stats.replied,
                                'responsesPrecentage': isNaN(Math.floor(100*item.stats.replied/item.stats.delivery))? 0 :Math.floor(100*item.stats.replied/item.stats.delivery),
                                'prospects':item.stats.prospects

                            };
                            rowData.push(row);
                        }

                    }

                    resolve(rowData) ;

                })
                .catch(e=>{
                    console.log(e);
                });


        }).catch(e=>{

        });
    });



}

function getEmailBody(rowData) {

    let header = `<table border="0" width="100%" cellpadding="0" cellspacing="0" bgcolor="ffffff" >

        <tr>
            <td align="center">
                <table border="0" align="center" width="590" cellpadding="0" cellspacing="0" class="container590">

                    <tr>
                        <td height="25" style="font-size: 25px; line-height: 25px;">&nbsp;</td>
                    </tr>

                    <tr>
                        <td align="center">

                            <table border="0" align="center" width="590" cellpadding="0" cellspacing="0" class="container590">

                                <tr>
                                    <td align="center" height="70" style="height:70px;background-color: rgb(2, 8, 67);">
                                        <a href="" style="display: block; border-style: none !important; border: 0 !important;"><img width="100" border="0" style="display: block; width: 100px;" src="http://dash.prospectgenai.com/img/ProspectGen_AI01_white.png" alt="" /></a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td height="25" style="font-size: 25px; line-height: 25px;">&nbsp;</td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>`;

    let footer = `<table border="0" width="100%" cellpadding="0" cellspacing="0" bgcolor="f4f4f4">

        <tr>
            <td height="25" style="font-size: 25px; line-height: 25px;">&nbsp;</td>
        </tr>

        <tr>
            <td align="center">

                <table border="0" align="center" width="590" cellpadding="0" cellspacing="0" class="container590">

                    <tr>
                        <td>
                            <table border="0" align="left" cellpadding="0" cellspacing="0" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;" class="container590">
                                <tr>
                                    <td align="left" style="color: #aaaaaa; font-size: 14px; font-family: 'Work Sans', Calibri, sans-serif; line-height: 24px;">
                                        <div style="line-height: 24px;">

                                            <span style="color: #333333;">ProspectGen AI</span>

                                        </div>
                                    </td>
                                </tr>
                            </table>


                        </td>
                    </tr>

                </table>
            </td>
        </tr>

        <tr>
            <td height="25" style="font-size: 25px; line-height: 25px;">&nbsp;</td>
        </tr>

    </table>`;
    let html= `<table style='background-color: rgba(0, 0, 0, 0);
border-collapse: collapse;
box-sizing: border-box;
color: rgb(33, 37, 41);
font-family: "Poppins", sans-serif;
font-size: 16px;
font-weight: 300;
line-height: 24px;
margin-bottom: 16px;
text-align: center;
width: 100%'>
                    <thead style='background-color: rgb(2, 8, 67);
border-collapse: collapse;
box-sizing: border-box;
color: rgb(255, 255, 255);
font-family: "Poppins", sans-serif;
font-size: 16px;
font-weight: 300;
line-height: 24px;
text-align: left;
height: 65px;'>
                        <tr>
                            <th scope="col">Company</th>
                            <th scope="col">Campaign</th>
                            <th scope="col">Status</th>
                            <th scope="col">Prospects</th>
                            <th scope="col">Email Delivered</th>
                            <th scope="col">Opened</th>
                            <th scope="col">Responses</th>
                        </tr>
                    </thead>
                    <tbody style='border-collapse: collapse;
box-sizing: border-box;
color: rgb(33, 37, 41);
font-family: "Poppins", sans-serif;
font-size: 16px;
font-weight: 300;
line-height: 24px;
text-align: left;
'>`;

    for(i=0;i<rowData.length;i++){
        console.log(rowData[i].company);
        html += `<tr>
                                        <th style='border-bottom-color: rgb(222, 226, 230);
        border-bottom-style: solid;
        border-bottom-width: 1px;
        border-collapse: collapse;
        border-top-color: rgb(255, 255, 255);
        border-top-style: none;
        border-top-width: 0px;
        box-sizing: border-box;
        font-family: "Poppins", sans-serif;
        font-size: 14.4px;
        font-weight: 400;
        line-height: 21.6px;
        padding-bottom: 16px;
        padding-top: 17.6px;
        text-align: left;
        vertical-align: bottom;'scope="row">${rowData[i].company}</th>
                                        <td style='border-bottom-color: rgb(222, 226, 230);
        border-bottom-style: solid;
        border-bottom-width: 1px;
        border-collapse: collapse;
        border-top-color: rgb(255, 255, 255);
        border-top-style: none;
        border-top-width: 0px;
        box-sizing: border-box;
        font-family: "Poppins", sans-serif;
        font-size: 14.4px;
        font-weight: 400;
        line-height: 21.6px;
        padding-bottom: 16px;
        padding-top: 17.6px;
        text-align: left;
        vertical-align: bottom;'>${rowData[i].campaign}</td>
                                        <td style='border-bottom-color: rgb(222, 226, 230);
        border-bottom-style: solid;
        border-bottom-width: 1px;
        border-collapse: collapse;
        border-top-color: rgb(255, 255, 255);
        border-top-style: none;
        border-top-width: 0px;
        box-sizing: border-box;
        font-family: "Poppins", sans-serif;
        font-size: 14.4px;
        font-weight: 400;
        line-height: 21.6px;
        padding-bottom: 16px;
        padding-top: 17.6px;
        text-align: left;
        vertical-align: bottom;'>${rowData[i].status}</td>
                                        <td style='border-bottom-color: rgb(222, 226, 230);
        border-bottom-style: solid;
        border-bottom-width: 1px;
        border-collapse: collapse;
        border-top-color: rgb(255, 255, 255);
        border-top-style: none;
        border-top-width: 0px;
        box-sizing: border-box;
        font-family: "Poppins", sans-serif;
        font-size: 14.4px;
        font-weight: 400;
        line-height: 21.6px;
        padding-bottom: 16px;
        padding-top: 17.6px;
        text-align: left;
        vertical-align: bottom;'>${rowData[i].prospects}</td>
                                        <td style='border-bottom-color: rgb(222, 226, 230);
        border-bottom-style: solid;
        border-bottom-width: 1px;
        border-collapse: collapse;
        border-top-color: rgb(255, 255, 255);
        border-top-style: none;
        border-top-width: 0px;
        box-sizing: border-box;
        font-family: "Poppins", sans-serif;
        font-size: 14.4px;
        font-weight: 400;
        line-height: 21.6px;
        padding-bottom: 16px;
        padding-top: 17.6px;
        text-align: left;
        vertical-align: bottom;'>${rowData[i].delivered} (${rowData[i].deliveredPrecentage}%)</td>
                                        <td style='border-bottom-color: rgb(222, 226, 230);
        border-bottom-style: solid;
        border-bottom-width: 1px;
        border-collapse: collapse;
        border-top-color: rgb(255, 255, 255);
        border-top-style: none;
        border-top-width: 0px;
        box-sizing: border-box;
        font-family: "Poppins", sans-serif;
        font-size: 14.4px;
        font-weight: 400;
        line-height: 21.6px;
        padding-bottom: 16px;
        padding-top: 17.6px;
        text-align: left;
        vertical-align: bottom;'>${rowData[i].opened} (${rowData[i].openedPrecentage}%)</td>
                                        <td style='border-bottom-color: rgb(222, 226, 230);
        border-bottom-style: solid;
        border-bottom-width: 1px;
        border-collapse: collapse;
        border-top-color: rgb(255, 255, 255);
        border-top-style: none;
        border-top-width: 0px;
        box-sizing: border-box;
        font-family: "Poppins", sans-serif;
        font-size: 14.4px;
        font-weight: 400;
        line-height: 21.6px;
        padding-bottom: 16px;
        padding-top: 17.6px;
        text-align: left;
        vertical-align: bottom;'>${rowData[i].responses} (${rowData[i].responsesPrecentage}%)</td>
                                        </tr>`;
    }

    html += `</tbody></table>`;

    return header+html;
}

module.exports = woodpeckMailer;