import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import puppeteer from 'puppeteer';
import AWS from 'aws-sdk';

const S3 = new AWS.S3();

export const generateCertificate = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (event.body) {
        const { volunteerName, date, voluntaryWorkName, imageUrl } = JSON.parse(event.body);

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        try {
            const params = {
                Bucket: process.env.AWS_TEMPLATES_BUCKET_NAME || '',
                Key: 'templates/general/certificate_template.html',
            };

            const { Body } = await S3.getObject(params).promise();
            const templateHtml = Body?.toString('utf-8') || '';

            if (templateHtml) {
                const certificateHtml = templateHtml
                    .replace('{{volunteerName}}', volunteerName)
                    .replace('{{date}}', date)
                    .replace('{{voluntaryWorkName}}', voluntaryWorkName)
                    .replace('{{imageSrc}}', imageUrl);

                await page.setContent(certificateHtml);
                const pdfBuffer = await page.pdf();

                const uploadParams = {
                    Bucket: process.env.AWS_CERTIFICATES_BUCKET_NAME || '',
                    Key: `certificates/${volunteerName}.pdf`,
                    Body: pdfBuffer,
                };

                await S3.upload(uploadParams).promise();
                await browser.close();

                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/pdf',
                    },
                    body: pdfBuffer.toString('base64'), 
                    isBase64Encoded: true,
                };
            } else {
                await browser.close();
                return {
                    statusCode: 500,
                    body: 'Error generating and storing the certificate: templateHtml is undefined',
                };
            }
        } catch (error) {
            await browser.close();
            return {
                statusCode: 500,
                body: 'Error generating and storing the certificate: ' + error,
            };
        }
    } else {
        return {
            statusCode: 400,
            body: 'Invalid request: Missing or empty request body',
        };
    }
};


