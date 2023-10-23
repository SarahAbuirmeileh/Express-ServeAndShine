import { configureLambda } from "../../utilities/AWSConfigureLambdaFunction.js";

const lambda = await configureLambda(); 

const invokeLambdaFunction = async (functionName: string, eventPayload: Record<string, any>) => {
    const params = {
        FunctionName: functionName,
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify(eventPayload),
    };     
    try {
        const data = await lambda.invoke(params).promise();

        if (data.Payload && typeof data.Payload === 'string') {
            const response = JSON.parse(data.Payload);
            return response;
        } else {
            throw new Error('Invalid Lambda response format');
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export{
    invokeLambdaFunction
}