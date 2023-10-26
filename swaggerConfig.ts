
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title:"Serve-and-Shine",
            version: "1.0.0"
        },
        servers: [{
            url:"http://localhost:3000"
        }],
        
    },
    apis: ["./dist/src/routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerSpec };
