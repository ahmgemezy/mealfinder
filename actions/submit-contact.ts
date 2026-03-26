"use server";

import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";import { devLog } from "@/lib/utils/logger";

// Validate env vars
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
// Handle newlines in private key if they were escaped
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

import { z } from "zod";

const ContactSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    email: z.string().email("Invalid email").max(100),
    subject: z.string().max(200).optional().default(""),
    message: z.string().min(1, "Message is required").max(5000),
});

export async function submitContactForm(formData: FormData) {
    const rawData = {
        name: formData.get("name"),
        email: formData.get("email"),
        subject: formData.get("subject"),
        message: formData.get("message"),
    };

    const validatedFields = ContactSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return { success: false, error: "Invalid or missing fields" };
    }

    const { name, email, subject, message } = validatedFields.data;

    if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
        devLog.error("Missing Google Sheets credentials");
        return { success: false, error: "Server configuration error" };
    }

    try {
        devLog.log(`Submitting contact form from: ${email}`);

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
        // 4. Check Headers (Check A1)
        await sheet.loadCells('A1:A1');
        const a1 = sheet.getCell(0, 0);

        if (!a1.value) {
            devLog.log("Sheet appears empty (A1 is null), initializing headers...");
            await sheet.setHeaderRow(['Timestamp', 'Name', 'Email', 'Subject', 'Message']);
        }

        // 5. Add Row (Array based is safer/simpler than Object-Header mapping)
        await sheet.addRow([
            new Date().toISOString(),
            name,
            email,
            subject || "No Subject",
            message,
        ]);

        return { success: true };
    } catch (error: unknown) {
        devLog.error("Error submitting to Google Sheets:", error);
        return { success: false, error: "Failed to submit message" };
    }
}
