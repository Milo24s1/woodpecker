const mongoose = require('mongoose');

const CampaignRecordSchema = mongoose.Schema({

    token : {
        type: String,
    },
    customCol1:{
        type: String,
    },
    customCol2:{
        type: String,
    },
    customCol3:{
        type: String,
    },
    campId : {
        type: Number,

    }
});

CampaignRecordSchema.index({ token: 1, campId: 1}, { unique: true });

const CampaignRecord = module.exports = mongoose.model('CampaignRecord',CampaignRecordSchema);

module.exports.addCampaignRecord = function (campaign,callback) {
    campaign.save(callback);
};

module.exports.getCampaignRecordsByToken = function (token,callback) {
    const query = {'token':token};
    CampaignRecord.find(query,callback);
};

module.exports.getCampaignRecordByCampaignId = function (campId,callback) {
    const query = {'campId':campId};
    CampaignRecord.find(query,callback);
};


