require('dotenv').config();
const lark = require('@larksuiteoapi/node-sdk');

const client = new lark.Client({
    appId: process.env.APP_ID,
    appSecret: process.env.APP_SECRET,
    appType: lark.AppType.SelfBuild,
    domain: lark.Domain.Feishu,
});

module.exports = client;