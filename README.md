# InvestPro Platform (Frontend Dashboard)

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Django](https://img.shields.io/badge/django-%23092E20.svg?style=for-the-badge&logo=django&logoColor=white)

A comprehensive, production-grade investment management platform featuring a dual-interface architecture (Customer Dashboard & Admin Panel). 

This repository contains the **Frontend** of the application, built with React and TypeScript, fully integrated with a decoupled Django REST API backend.

🔗 **Live Platform:** [investpro-company.com](https://investpro-company.com/)

---

## Platform Overview

InvestPro is a role-based SaaS investment system designed to handle complex financial operations, including daily returns, KYC verifications, and multi-currency deposits.

### Customer Portal
- **Authentication & Security:** JWT-based login, Registration, Password Reset (OTP).
- **Financial Operations:** Create deposit requests (with image proof), request withdrawals, and track transaction history.
- **Investment Management:** Browse, subscribe to, and track high-yield investment packs.
- **Compliance & Support:** Identity verification via KYC document uploads, built-in ticketing system, and task/message center.
- **Localization:** Full i18n support featuring dynamic switching between English (EN) and Arabic (AR).

### Admin Control Panel
- **User Management:** Monitor users, adjust balances manually, and oversee platform activity.
- **Pack & Yield Management:** Create, update, activate, or deactivate investment plans.
- **Transaction Approvals:** Review and approve/reject deposit proofs (via compact UI modals) and withdrawal requests.
- **Compliance Center:** Review KYC document submissions and manage customer support tickets.

---

## System Architecture & Tech Stack

### Frontend Architecture
- **Core:** React 18, TypeScript (Strict Mode)
- **Styling:** TailwindCSS for responsive, utility-first UI
- **Networking:** Axios with global interceptors for JWT token attachment
- **State & Routing:** React Router DOM (Role-based protected routes)

### Backend Architecture (External API)
- **Core:** Django & Django REST Framework (DRF)
- **Storage:** Secure media file handling (`/media/`) for KYC and deposit proofs
- **Auth:** JWT (Access & Refresh tokens)

---

## Technical Highlights & Design Decisions

### 1. Complex File Uploads (Multipart Form Data)
Handling file uploads in a decoupled architecture requires strict `FormData` parsing. Deposit proofs and KYC documents are sent securely to the Django backend:

```typescript
const formData = new FormData();
formData.append("amount", amount);
formData.append("payment_method", "USDT_TRON");
formData.append("proof", selectedFile); // Image Blob/File
```

### 2. Centralized Media Resolution
To bridge the gap between the decoupled frontend and the Django /media/ directory, a dynamic media resolver utility was implemented:

```typescript
export function mediaUrl(path: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;

  const origin = import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, "");
  return `${origin}${path}`;
}
```

### 3. Localization (i18n) Engine
Built a lightweight, dictionary-based translation system mapping dashboard labels dynamically without heavy external dependencies, ensuring lightning-fast language switching.

---

### Local Development Setup
Prerequisites
- Node.js (v18+)
- Backend Django API running locally or accessible remotely.

---

### Installation
1. Clone the repository:

    ```
    git clone [https://github.com/yourusername/investpro-frontend.git](https://github.com/yourusername/investpro-frontend.git)
    cd investpro-frontend
    ```

2. Install dependencies:

   ```
   npm install 
   ```

3. Environment Configuration:
   Create a .env.local file in the root directory and define the API URL:
   ```
   VITE_API_BASE_URL=http://localhost:8000/api
   ```
   (Ensure the backend has CORS enabled for http://localhost:5173 or your local port).

4. Start the development server:
   ```
   npm run dev
   ```
   ---
   
### Project Structure
src/
 ├── api/            # Axios instances and API endpoint wrappers
 ├── components/     # Reusable UI components (Modals, Buttons, Inputs)
 ├── hooks/          # Custom React hooks (Auth, Fetching)
 ├── i18n/           # Translation dictionaries (en.ts, ar.ts)
 ├── pages/
 │    ├── admin/     # Admin-only views
 │    └── customer/  # Customer dashboard views
 ├── utils/          # Helpers (mediaUrl.ts, formatters)
 └── main.tsx        # App entry point & Context providers
  
---

### Future Ideas
- Automated JWT Token Refresh via Axios Interceptors.

- Advanced Referral System Tracking.

- WebSocket integration for real-time notification center.

- Image Zoom / Lightbox functionality for Admin proof review.

---

Developed by Ali Romia - Full-Stack Software Engineer

   


