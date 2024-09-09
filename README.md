# Nextise Full-Stack Developer Recruitment Test

Thank you for participating in our full-stack coding test. This challenge involves building a tool for managing seminars, allowing users to sign in, create a course, assign a trainer, and send notifications to trainers upon assignment.

The focus of this test is on implementing the core **functionalities**, not UI design. You should be able to complete the task within **1 hour**.

## Grading Criteria

Your submission will be evaluated on:

- Correctness and implementation of the requested features.
- Functional Docker Compose setup.
- Proper Git usage with clear commit history.
- Backend security, input validation, and error handling.
- Handling of external services (email notifications).

## Prerequisites/Environment Setup

**Technologies required**:

- **Next.js** (LTS): You can choose between the App Router or Pages structure.
- **Node.js**: LTS/Gallium (^16.19.0)
- **MongoDB or MySQL**: For data storage.
- **Docker**: For containerization.
- **Mailhog**: For testing email notifications.

## Task

### Features

1. **Course Model**:

   - Course Name
   - Course Date
   - Course Subject (e.g., React.js, Next.js)
   - Course Location
   - Course Participants
   - Course Notes
   - Course Price
   - Course Trainer Price

2. **Trainer Model**:
   - Trainer Name
   - Trainer Training Subjects (e.g., React.js, Next.js)
   - Trainer Location
   - Trainer Email

### Sample Model Data:

```json
{
  "course": {
    "name": "Advanced React.js",
    "date": "2024-09-15",
    "subject": "React.js",
    "location": "Stuttgart",
    "participants": 20,
    "notes": "Focus on hooks and context API",
    "price": 2000,
    "trainer_price": 500
  },
  "trainer": {
    "name": "John Doe",
    "training_subjects": ["React.js", "Next.js"],
    "location": "Berlin",
    "email": "john.doe@example.com"
  }
}
```

### Functional Requirements:

- **Login Page**: User login with a username and password (hardcoded credentials are acceptable).
- **Home Page**: Display a list of all courses.
- **Create Course**: A form to create a new course with the fields described above.
- **Create Trainer**: A form to create a new trainer.
- **Assign Trainer**: Functionality to assign a trainer to a course.
- **Email Notification**: Once a trainer is assigned, send an email to the trainer with all course details using **Node.js SMTP mailer** (Mailhog for local testing).

### Docker Setup

The project must be containerized using **Docker Compose**, including:

- Frontend (Next.js)
- Backend (Node.js)
- Database (MongoDB or MySQL)
- **Mailhog** for email testing

## Running the Project

### Frontend:

- `npm start`: Start the application in development mode.
- `npm run build`: Create a production-optimized build.
- `npm test`: Run any frontend tests.

### Backend:

- Ensure the Node.js server is running and all API endpoints are functional (login, course creation, trainer assignment, etc.).

### Docker Compose:

- Create a `docker-compose.yml` file to manage all services.
- Ensure frontend and backend services are containerized and communicating properly.
- Set up **Mailhog** for testing email notifications.

## Submission Guidelines

- You must create your own Git repository for the project.
- Proper Git usage is a key part of the evaluation, so ensure a clean and logical commit history.
- Once completed, share the link to your repository with us for review.
- Do **not** include the `node_modules` folder.
- Include a `FOLLOW-UP.md` file with answers to any additional questions or notes about the process.
