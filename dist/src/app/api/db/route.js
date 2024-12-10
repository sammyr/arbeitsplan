"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.PUT = PUT;
const server_1 = require("next/server");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const dbPath = path_1.default.join(process.cwd(), 'data/db.json');
async function GET() {
    try {
        const data = await fs_1.promises.readFile(dbPath, 'utf8');
        const jsonData = JSON.parse(data);
        // Initialize logs array if it doesn't exist
        if (!jsonData.logs) {
            jsonData.logs = [];
        }
        return server_1.NextResponse.json(jsonData);
    }
    catch (error) {
        console.error('Error reading database:', error);
        return server_1.NextResponse.json({ error: 'Failed to read database' }, { status: 500 });
    }
}
async function PUT(request) {
    try {
        const data = await request.json();
        // Ensure logs array exists
        if (!data.logs) {
            data.logs = [];
        }
        await fs_1.promises.writeFile(dbPath, JSON.stringify(data, null, 2));
        return server_1.NextResponse.json({ success: true });
    }
    catch (error) {
        console.error('Error writing to database:', error);
        return server_1.NextResponse.json({ error: 'Failed to write to database' }, { status: 500 });
    }
}
