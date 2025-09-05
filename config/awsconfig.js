const aws = require("aws-sdk");
const dotenv = require("dotenv");
dotenv.config();

aws.config.update({
    region: process.env.AWS_REGION || "us-east-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
module.exports = aws;