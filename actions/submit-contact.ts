"use server";

import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

// Validate env vars
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
// Handle newlines in private key if they were escaped
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

export async function submitContactForm(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    if (!name || !email || !message) {
        return { success: false, error: "Missing required fields" };
    }

    if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
        console.error("Missing Google Sheets credentials");
        return { success: false, error: "Server configuration error" };
    }

    try {
        console.log(`Submitting contact form from: ${email}`);

        // 1. Authenticate
        const serviceAccountAuth = new JWT({
            email: CLIENT_EMAIL,
            key: PRIVATE_KEY,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);

        // 2. Load Info
        await doc.loadInfo();

        // 3. Get first sheet
        const sheet = doc.sheetsByIndex[0];

        // 4. Check/Set Headers
        try {
            await sheet.loadHeaderRow();
        } catch (e) {
            // If checking headers fails, it likely means the sheet is empty or has no headers
            // So we initialize them
            console.log("Sheet appears empty, initializing headers...");
            const headers = ['Timestamp', 'Name', 'Email', 'Subject', 'Message'];
            await sheet.setHeaderRow(headers);
        }

        // 5. Add Row
        await sheet.addRow({
            Timestamp: new Date().toISOString(),
            Name: name,
            Email: email,
            Subject: subject || "No Subject",
            Message: message,
        });

        return { success: true };
    } catch (error) {
        console.error("Error submitting to Google Sheets:", error);
        return { success: false, error: "Failed to submit message" };
    }
}
