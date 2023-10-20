import { UploadedFile } from "express-fileupload";
import baseLogger from "../../../logger.js";
import { VoluntaryWork } from "../../db/entities/VoluntaryWork.js";
import { configureS3Bucket } from "../../utilities/AWS_configure_S3.js";

const putImages = async (id: number, uploadedFiles: UploadedFile[]) => {
    try {

        let voluntaryWork = await VoluntaryWork.findOne({ where: { id } });
        if (voluntaryWork) {

            const S3 = await configureS3Bucket();
            const imageUrls = [];

            for (const file of uploadedFiles) {
                const uploadParams = {
                    Bucket: process.env.AWS_BUCKET_NAME || '',
                    Body: Buffer.from(file.data),
                    Key: `${voluntaryWork.name}/${Date.now().toString()}.png`,
                    ACL: 'public-read',
                };

                const data = await S3.upload(uploadParams).promise();
                imageUrls.push(data.Location);
            }

            voluntaryWork.images.push(...imageUrls);
            await voluntaryWork.save();
        }
    } catch (err) {
        baseLogger.error(err);
        throw ", when trying to add Image";
    }
}

const putCertificateTemplate = async (id: number, uploadedFiles: UploadedFile[]) => {
    try {

        let voluntaryWork = await VoluntaryWork.findOne({ where: { id } });
        if (voluntaryWork) {

            const S3 = await configureS3Bucket();
            const imageUrls = [];

            for (const file of uploadedFiles) {
                const uploadParams = {
                    Bucket: process.env.AWS_CERTIFICATES_BUCKET_NAME || '',
                    Body: Buffer.from(file.data),
                    Key: `templates/${voluntaryWork.name}/${file.name}`,
                    ACL: 'public-read',
                };

                const data = await S3.upload(uploadParams).promise();
                imageUrls.push(data.Location);
           }
        }
    } catch (err) {
        baseLogger.error(err);
        throw err;
    }
}

export { putImages, putCertificateTemplate }