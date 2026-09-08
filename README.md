# Oracle HCM Approvals Academy

A pure Next.js (JavaScript) full-stack web application for Oracle HCM learning, practice tasks, mock interviews, and trainee/trainer workflows.

## Tech Stack

- **Framework**: Next.js (App Router, Pure JavaScript / JSX)
- **Database**: MongoDB with Mongoose
- **File & Media Storage**: Cloudinary
- **Authentication**: JWT (`jsonwebtoken`) & `bcryptjs` with secure HTTP-only cookies
- **Styling**: Bootstrap 5 + Bootstrap Icons + Custom Academy CSS

## Key Features

- **Sequential Curriculum**: Interactive modules covering DFF, EFF, KFF, Approvals, Absence, Journeys, OTBI, HDL, Fast Formula, Work Schedules, Operations, Redwood, and Security.
- **Trainee Portal**: Registration, personal dashboard, progress tracking, time logging, and sequential task unlocking.
- **Task Workspace**: Task document submissions with Cloudinary attachments and trainer review workflows.
- **Mock Interviews**: Interactive scenario interview simulator with audio recording support and AI evaluations.
- **Trainer & Admin Console**: Role manager, content manager (video/resource attachments), trainee approvals, and voice interview review.

## Environment Configuration

Create a `.env.local` file in the project root:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/chc_academy?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Cloudinary (File & Audio Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Admin / Owner Access
ADMIN_EMAIL=admin@example.com
OWNER_EMAIL=admin@example.com
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Start production server:
   ```bash
   npm start
   ```

## Project Structure

- `app/`: Pure Next.js App Router pages and components (`.jsx` and `.js`)
  - `app/api/`: Backend API route handlers (`route.js`)
  - `app/dashboard/`: Trainee dashboard
  - `app/task-workspace/`: Submissions workspace
  - `app/interview/`: Mock interview simulator
  - `app/trainer/`: Trainer management consoles
  - `app/admin/`: Role management
- `lib/`: Core utility libraries (MongoDB client, JWT auth, Cloudinary client)
- `models/`: Mongoose models (User, TraineeProfile, TaskDocument, etc.)
- `public/`: Static assets and branding
