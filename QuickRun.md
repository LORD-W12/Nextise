# Quick Start Guide & Demo

This short tutorial will guide you step by step to run the application, log in, and explore the various features of the **Seminar Management System**.

---

## 1. Running the Application via Docker

The project is fully containerized. Docker will handle starting the web application, the database, and the local email testing server (Mailhog).

1. Open your terminal and navigate to the web project directory:
   ```bash
   cd seminar-management
   ```
2. Create a `.env` file at the root of `seminar-management` (you can copy the contents from `.env.example`). For the AI features, make sure to enter your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

   
3. Launch the containers in the background with the following command:
   ```bash
   docker compose up -d --build
   ```
4. Optional: Apply Prisma migrations (if the container hasn't done it automatically):
   ```bash
   docker exec -it seminar-management-app npx prisma db push
   ```

*The application should now be accessible at [http://localhost:3000](http://localhost:3000).*

---

## 2. Platform Authentication (Login)

Go to [http://localhost:3000](http://localhost:3000) in your browser.
You will be redirected to the authentication page (`/login`).

Enter the default administrator credentials:
- **Username:** `admin`
- **Password:** `password`

*(Authentication is secured by JWT via HttpOnly cookies)*

---

## 3. Overview of Features to Test

Once logged in, you will land on the **Dashboard**. Here is the ideal flow to test the architecture's robustness:

### A. Trainer Management
1. Go to the **Trainers** menu.
2. **Create a trainer:** Click on *Add Trainer*. Fill in their name, areas of expertise (e.g., `React, Node.js`), location, and save.
3. Freely test editing and deleting trainers to observe the success toasts provided by the UI.

### B. Seminar Management (Courses)
1. Go to the **Courses** menu.
2. **Create a course:** Click on *Add Course*. Fill in the subject (e.g., `Advanced Next.js Training`), the start and end dates, and the location. 
3. Assign a trainer to the seminar.

### C. Conflict Detection (Domain Logic)
This allows you to test the business use cases in isolation:
1. Try to create a **second course** at the same date/time, at the same location, or by trying to assign the **same trainer**.
2. The system (thanks to the Clean Architecture implemented in the backend) will reject the request to prevent double-booking or scheduling conflicts.

### D. AI Matching (Google Gemini Integration)
1. When creating/editing a course, interact with the **AI Suggestion** button (if functional inside the assignment component).
2. The application will send the course subjects and the list of trainers to the Gemini API.
3. Gemini will return the ID of the trainer whose profile best matches the subject, demonstrating the AI integration.

### E. Email Notifications (Mailhog)
1. When a course is created and a trainer is assigned, the application dispatches an email via `nodemailer`.
2. Open the **Mailhog** web interface (the local test mail server configured in the `docker-compose`) by visiting: [http://localhost:8025](http://localhost:8025)
3. You will intercept the assignment emails there (e.g., "You have been assigned to a new training course").

---
**End of session!**
To stop your environment, simply type:
```bash
docker compose down
```
