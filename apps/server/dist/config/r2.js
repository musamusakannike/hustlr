"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToR2 = exports.getR2PresignedUrl = exports.r2Client = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const accountId = process.env.R2_ACCOUNT_ID || '';
const accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
exports.r2Client = new client_s3_1.S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});
const getR2PresignedUrl = async (bucket, key, expiresInSeconds = 3600) => {
    const command = new client_s3_1.GetObjectCommand({ Bucket: bucket, Key: key });
    return (0, s3_request_presigner_1.getSignedUrl)(exports.r2Client, command, { expiresIn: expiresInSeconds });
};
exports.getR2PresignedUrl = getR2PresignedUrl;
const uploadToR2 = async (bucket, key, body, contentType) => {
    const command = new client_s3_1.PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
    });
    return exports.r2Client.send(command);
};
exports.uploadToR2 = uploadToR2;
