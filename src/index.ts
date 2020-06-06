import {config} from "dotenv";
import {BotServer} from "./server/bot-server";

async function main(): Promise<void> {
    // Setup the environment variables
    config();
    // Create a server
    const server: BotServer = new BotServer();
    // Start the server
    server.start();
}

void main();
