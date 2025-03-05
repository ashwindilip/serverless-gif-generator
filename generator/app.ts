import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import axios from "axios";

const GIPHY_API_KEY = process.env.GIPHY_API_KEY;
const GIPHY_API_URL = "https://api.giphy.com/v1/gifs/search";

export const lambdaHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    try {
        if (!GIPHY_API_KEY) {
            console.error("GIPHY API key is missing.");
            return {
                statusCode: 500,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: "Internal server error" })
            };
        }

        const prompt = event.pathParameters?.prompt;
        if (!prompt) {
            return {
                statusCode: 400,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: "Prompt is required" })
            };
        }

        const response = await axios.get(GIPHY_API_URL, {
            params: {
                api_key: GIPHY_API_KEY,
                q: prompt,
                limit: 1, 
                rating: "g", 
            },
        });

        //console.log(response);

        const gifData = response.data?.data;
        if (!gifData || gifData.length === 0) {
            return {
                statusCode: 404,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: "No GIF found for the given prompt" })
            };
        }

        const gifUrl = gifData[0].images.fixed_width_downsampled?.url;
        //const gifResponse = await axios.get(gifUrl, { responseType: "arraybuffer" });

        return {
            headers : {"Content-Type": "application/json"},
            statusCode: 200,
            body: gifUrl,
        };

        /*return {
            statusCode: 200,
            headers: {
                "Content-Type": "image/gif",
                "Content-Length": gifResponse.data.length.toString(),
             },
            body: gifResponse.data.toString("base64"),
            isBase64Encoded: true,
        };*/
    } catch (error: any) {
        console.error("Error fetching GIF:", error.message);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Failed to fetch GIF" })
        };
    }
};
