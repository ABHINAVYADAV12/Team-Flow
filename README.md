# TeamFlow — Task Manager

A full-stack, comprehensive web application designed for teams to efficiently manage projects, assign tasks, and track overall progress using a dynamic Kanban-style interface. 

Built with **Next.js**, **MongoDB (Mongoose)**, and custom **Vanilla CSS** to deliver a sleek, modern, and highly responsive dark-mode glassmorphism UI.

## 🚀 Key Features

*   **Role-Based Access Control (RBAC):** Distinct `Admin` and `Member` roles.
    *   **Admins** have full control: create projects, add team members, and create/assign tasks.
    *   **Members** have focused access: view projects they belong to, and update the status of tasks assigned to them.
*   **Dynamic Dashboard:** Real-time metrics overview, including total tasks, in-progress tasks, completed tasks, and automatically flagged overdue tasks.
*   **Project Management:** Create dedicated project workspaces with custom descriptions and color coding.
*   **Kanban Task Board:** Intuitive "To Do", "In Progress", and "Done" columns for seamless workflow tracking.
*   **Secure Authentication:** Custom-built JSON Web Token (JWT) based authentication stored securely in `HttpOnly` cookies. Passwords are cryptographically hashed via `bcryptjs`.

## 🛠️ Tech Stack

*   **Frontend:** React 19, Next.js 16 (App Router)
*   **Backend:** Next.js Serverless API Routes
*   **Database:** MongoDB, Mongoose ODM
*   **Styling:** Pure Vanilla CSS with CSS Variables & Flexbox/Grid
*   **Security:** JWT (jsonwebtoken), bcryptjs

## 📦 Installation & Setup

1.  **Clone the repository** (if applicable) or navigate to the project directory:
    ```bash
    cd task-manager
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env.local` file in the root directory and add your MongoDB connection string and a secure JWT secret:
    ```env
    MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/?appName=Cluster0
    JWT_SECRET=your_super_secret_jwt_key
    NEXT_PUBLIC_APP_URL=http://localhost:3000
    ```

4.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    *The application will be accessible at http://localhost:3000*

## 💡 How It Works

1.  **First User Setup:** The very first user to sign up is automatically granted the `admin` role. Subsequent users will be standard `member`s.
2.  **Creating a Project:** Admins can navigate to the Projects tab and create a new project. 
3.  **Adding Members:** Inside a project, Admins can add registered users to the project workspace.
4.  **Assigning Tasks:** Admins can create tasks within a project, set priority levels, due dates, and assign them to project members.
5.  **Tracking Progress:** Members can update the status of their assigned tasks, which reflects instantly on the project's Kanban board and updates the global Dashboard statistics.
