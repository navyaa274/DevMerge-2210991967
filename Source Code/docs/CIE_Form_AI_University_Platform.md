# CIE – COPYRIGHT INFORMATION EXTRACTION FORM

**Title:** AI University Platform – Exam Nexus & Comprehensive Academic Automation  
**School:** Chitkara University, Rajpura, Punjab

**Detail of the student/mentor who uploaded the copyright on Govt portal**  
- Name: Ashish Yadav  
- Roll No/Employee Code: 2210991404  
- Login & password to be shared with mentors

**All Members Details Including Supervisor**

| Name | Emp Code/Roll | Address | Email | Mobile |
| --- | --- | --- | --- | --- |
| Hitesh Saini | 2210991670 | Samalkha, Panipat, Haryana | hitesh1670.be22@chitkara.edu.in | 8168562334 |
| Ashish Yadav | 2210991404 | Davopur, Nandganj, Ghazipur, Uttar Pradesh 233303 | ashish1404.be22@chitkara.edu.in | 7080734346 |
| Dr. Shikha Tuteja | CET1002580 | House No. 2412, Sector 71, Near Hemkunt Public School, Mohali 160071 | Shikha.1290@chitkara.edu.in | 9915369888 |

---

## Abstract

**1.1 Problem Background**  
Universities need integrated digital platforms to handle learning management, assessments, student services, and automation at scale. Existing tools are fragmented: LMS, exam prep, content generation, and admin workflows often live in separate systems, forcing manual coordination and causing inconsistent user experiences, higher operational overhead, and limited data-driven insights.

**1.2 Objective of the Project**  
Build a unified AI-powered university platform that delivers structured exam preparation (“Exam Nexus”), academic content generation, student services, and institutional automation in one system—improving revision efficiency, operational reliability, and data-driven decision-making.

**1.3 Proposed Solution / System Overview**  
A client–server web platform (React frontend, Node.js/Express backend, MongoDB, Redis, Socket.IO) that:
- Provides student-facing exam revision, content generation, MCQ practice, and progress dashboards.
- Offers faculty/admin tools for course content, assessments, analytics, and automation.
- Exposes secure APIs, rate limiting, authentication/authorization, and monitoring.
- Uses queues/schedulers for background tasks, notifications, and backups.

Core modules include User Auth & Security, Content Upload & Processing, Revision Notes Generator, Question Prediction, MCQ Practice, Progress & Analytics Dashboards, Automation & Scheduling, API Gateway/Docs, and Storage/Uploads.

**1.3 Key Features / Functionality**  
- Automated syllabus analysis → concise notes, key points, predicted questions, MCQs.  
- Personalized dashboards with progress tracking and structured revision flows.  
- Real-time collaboration/updates via Socket.IO for notifications and status.  
- Secure auth (JWT, rate limiting, helmet, cors) and role-based access.  
- API documentation (Swagger), logging/metrics, and scheduled jobs (cron/queues).  
- File handling and uploads for study material and generated assets.  
- Deployment support (Docker/K8s scripts), backups, and migration utilities.

**1.4 Technology / Method Used**  
- Frontend: React.js, React Router, TailwindCSS, Chart.js/Recharts, Framer Motion.  
- Backend: Node.js, Express.js, Mongoose/MongoDB, Redis, Bull queues, Node-cron.  
- Security & Utilities: JWT, bcrypt, express-rate-limit, helmet, xss protection.  
- Tooling: Git, eslint/prettier, mocha/jest, swagger-jsdoc, nodemon.  
- Packaging/Deployment: Docker, Kubernetes manifests, nginx config (for reverse proxy).  
- Supporting libs: axios, socket.io, multer, winston logging, dotenv config.

**1.5 Expected Outcome & Benefits**  
- Faster, exam-focused revision with automatically generated notes and MCQs.  
- Reduced operational overhead through automation (scheduling, backups, workflows).  
- Improved student engagement and performance via progress insights and targeted content.  
- Consistent, secure APIs for faculty/admin apps, enabling analytics and reporting.  
- Scalable foundation for further AI-driven academic services.

**1.6 Original Contribution Statement**  
Integrates exam-oriented content transformation and university automation into a single AI-driven platform—combining syllabus-to-revision generation, predictive questioning, interactive practice, and operational workflows under one coherent architecture.

---

> To convert this to .docx locally: open this file in Word (or copy-paste) and save as .docx. If you want, I can also provide a PowerShell snippet to package it into .docx using pandoc if available on your system.
