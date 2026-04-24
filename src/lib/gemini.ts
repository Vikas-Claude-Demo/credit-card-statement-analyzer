/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { StatementData } from "../types";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '' 
});

export async function extractTransactionsFromPDF(input: { base64?: string; text?: string }): Promise<StatementData> {
  const model = "gemini-3-flash-preview";
  
  const parts: any[] = [];
  
  if (input.base64) {
    parts.push({
      inlineData: {
        mimeType: "application/pdf",
        data: input.base64,
      },
    });
  } else if (input.text) {
    parts.push({
      text: `Source Text from Statement:\n${input.text}\n\n`,
    });
  }

  parts.push({
    text: `Extract all transaction details from this credit card statement. 
    Return the data in a structured JSON format. 
    For each transaction, include: date, description, amount (numeric, absolute value), category (e.g., Food, Travel, Utilities, etc.), and remarks (any specific notes like merchant location or transaction type), and transactionType (one of: 'debit', 'credit', 'payment').
    Also include a summary with totalSpent, totalCredits (if any payments are visible), period (start and end date), and cardType.
    Ensure the amounts are parsed correctly as numbers. 
    A 'debit' is a purchase or fee. A 'credit' is a refund or adjustment. A 'payment' is a bill payment towards the card balance. All amounts should be absolute positive values.`,
  });

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts,
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          transactions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                description: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                category: { type: Type.STRING },
                remarks: { type: Type.STRING, description: "Include details like Tax, GST, or specific merchant notes" },
                transactionType: { type: Type.STRING, enum: ["debit", "credit", "payment"] },
              },
              required: ["date", "description", "amount", "category", "remarks", "transactionType"],
            },
          },
          summary: {
            type: Type.OBJECT,
            properties: {
              totalSpent: { type: Type.NUMBER },
              totalCredits: { type: Type.NUMBER },
              period: { type: Type.STRING },
              currency: { type: Type.STRING, description: "Currency symbol or code like $ or INR" },
              cardType: { type: Type.STRING },
            },
            required: ["totalSpent", "totalCredits", "period", "currency"],
          },
        },
        required: ["transactions", "summary"],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Failed to extract data from statement. No response from AI.");
  }

  try {
    return JSON.parse(text) as StatementData;
  } catch (error) {
    console.error("Failed to parse AI response:", text);
    throw new Error("Failed to parse structured data from statement.");
  }
}
