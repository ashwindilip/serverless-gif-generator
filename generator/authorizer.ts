import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from "aws-lambda";
import * as jwt from "jsonwebtoken"; 

const PUBLIC_KEY = process.env.PUBLIC_KEY || "";

export const lambdaHandler = async (
    event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
    try {
        if (!event.authorizationToken) {
            throw new Error("Missing token");
        }

        const token = event.authorizationToken.replace("Bearer ", "");
        const decodedToken = jwt.verify(token, PUBLIC_KEY, { algorithms: ["RS256"] });

        console.log("Decoded Token:", decodedToken);

        return generatePolicy("user", "Allow", event.methodArn);
    } catch (error) {
        console.error("Unauthorized:", error.message);
        return generatePolicy("user", "Deny", event.methodArn);
    }
};

const generatePolicy = (principalId: string, effect: "Allow" | "Deny", resource: string) => {
    return {
        principalId,
        policyDocument: {
            Version: "2012-10-17",
            Statement: [
                {
                    Action: "execute-api:Invoke",
                    Effect: effect,
                    Resource: resource,
                },
            ],
        },
    };
};
