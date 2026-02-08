# NEPAS Integrated Neurodivergence Case Management System (NICMS)

## Overview
This is a purely HTML/JS/CSS implementation of the NICMS system. It runs entirely in the browser and uses `localStorage` to simulate a database, making it offline-capable and easy to demonstrate.

## How to Run
1.  Navigate to the `nicms-system` folder.
2.  Double-click `index.html` to open it in your web browser.

## Demo Credentials
Use the following credentials to test different user roles:

| Role | Username | Password | Features Accessible |
|------|----------|----------|---------------------|
| **Core Team** | `admin` | `password` | Full Access, Global Reports, All Counties |
| **Cluster Supervisor** | `supervisor` | `password` | Assigned County (Nairobi) Only, Reports, Assessments |
| **Assessment Officer** | `assessor` | `password` | Assessments Only (Nairobi) |
| **Intervention Officer** | `intervenor` | `password` | Interventions Only (Nairobi) |

## Features Implemented
1.  **Client Onboarding**: Register new clients with biodata and location.
2.  **Assessment & Severity**: Clinical scoring tools that auto-calculate severity (Mild/Moderate/Severe) and trigger escalations.
3.  **Intervention Tracking**: Log therapy sessions and progress.
4.  **Role-Based Access Control (RBAC)**: Menus and data access change based on who is logged in.
5.  **Geographic Gating**: Supervisors/Staff can only see cases in their assigned county.
6.  **Reporting**: Visual dashboards for severity distribution and caseloads.

## Technical Notes
-   **Data Persistence**: Data is saved to your browser's Local Storage. It will persist even if you close the browser, but clearing cache will wipe it.
-   **Offline First**: No internet connection required to run.
