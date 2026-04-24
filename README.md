# StatementFlow | AI Credit Card Statement Analyzer

StatementFlow is a powerful, AI-driven credit card statement analyzer that transforms complex PDF statements into actionable financial insights. Built with React, Vite, and Google Gemini AI, it provides a seamless and secure way to understand your spending patterns.

![StatementFlow Logo](public/favicon.png)

## 🌟 Overview

**StatementFlow** is a high-precision financial utility designed to simplify credit card statement management. By combining the power of **Google Gemini 2.0 Flash** with a modern, intuitive interface, it provides instant clarity on your spending habits.

**Keywords**: *Credit Card Statement Analyzer, AI Finance, PDF Transaction Extraction, Gemini AI, Spending Insights, Financial Dashboard, StatementFlow, Brilworks.*

## 🚀 Features

-   **AI-Powered Parsing**: Uses Google Gemini 2.0 Flash to accurately extract transaction details from PDF statements with 99% logic precision.
-   **Multi-Bank Support**: Robust parsing logic designed to handle statements from major banks like Amex, Chase, and more.
-   **Interactive Dashboard**: Visualize your spending with dynamic charts and category-wise breakdowns.
-   **Transaction Activity**: A detailed, searchable table of all your transactions.
-   **Export to CSV**: Easily export your extracted data for use in other financial tools.
-   **Secure & Private**: Processing is done with high security standards, ensuring your financial data remains private.
-   **Premium UI**: A modern, responsive interface built with Tailwind CSS and Framer Motion for a smooth user experience.

## 🛠️ Tech Stack

-   **Frontend**: React 19, TypeScript, Vite
-   **Styling**: Tailwind CSS, Lucide React (Icons)
-   **Animations**: Framer Motion
-   **AI Engine**: Google Gemini API (@google/genai)
-   **Data Visualization**: Recharts
-   **PDF Processing**: pdf-lib, pdfjs-dist

## 🏁 Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   npm or yarn
-   A Google Gemini API Key

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/credit-card-statement-analyzer.git
    cd credit-card-statement-analyzer
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up environment variables**:
    Create a `.env` file in the root directory and add your Gemini API key:
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```

4.  **Run the application**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deployment

### Vercel

This project is optimized for deployment on Vercel.

1.  Connect your GitHub repository to Vercel.
2.  Add `GEMINI_API_KEY` to your environment variables in the Vercel dashboard.
3.  Vercel will automatically detect the Vite configuration and deploy your app.

## 📄 License

This project is licensed under the Apache-2.0 License. See the [LICENSE](LICENSE) file for details.

---
Built with ❤️ by Brilworks
