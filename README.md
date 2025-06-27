# Mobile Garage Management System by: FAITH NKARICHIA

## Dscription

- The Mobile Garage Management System is a full-stack web application designed with love to make garage life easier and more efficient. It allows customers to book vehicle service requests from the comfort of their home—no more waiting in line at the garage.

- Once a request is submitted, the admin assigns a qualified mechanic and facilitates smooth communication between the customer and the mechanic.

- Meanwhile, admins can oversee service operations, manage mechanics, and track inventory usage behind the scenes ensuring everything runs smoothly.

## Schema

![ERD Diagram](./assets/erd.png)



## Loom video link
[loom video](https://www.loom.com/share/f662f09da538435eaf8be28bee7ca399?sid=2064e6da-0b84-4afe-9ce4-75c870c4bfe0)
## Features

- Role-based access for Admins, Mechanics, and Customers

- Customers can submit and monitor service requests

- Mechanics can view assigned tasks and update their status

- Admins can manage users, services, and inventory

- Real-time inventory updates based on part usage

- Fully responsive and user-friendly interface

## Technologies Used

` Frontend: React, Vite, Tailwind CSS – deployed on Vercel`

`Backend: Flask, Flask SQLAlchemy, JWT Authentication – deployed on Render`

` Database: PostgreSQL – hosted on Neon`

## Deployment

- You can view the `frontend live` on [ Mobile garage management system](https://mobile-garage-management-system.vercel.app/)
- You can view the `flask backend` here [ Mobile garage management system](https://mobile-garage-management-system.onrender.com)

## Setup and Installation Requirements

Follow these steps to set up the project on your local machine.

1. Clone the Repository
   ```bash
    git clone https://github.com/your-username/mobile-garage-management-system.git
    cd mobile-garage-management-system
   ```
2. Backend Setup (Flask + PostgreSQL)
   ```bash
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
   ```
   - Create a .env file inside the backend/ folder and add the following:

```bash
DATABASE_URL=postgresql://your-username:your-password@localhost:5432/mobile_garage
JWT_SECRET_KEY=your_jwt_secret_key
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_email_password
```

    - Make sure PostgreSQL is installed and your database mobile_garage is created.

3. Run Migrations

```bash
    flask db init     # only the first time
    flask db migrate -m "Initial migration"
    flask db upgrade
```

4. Start the Backend Server

```bash
flask run --debug
```

3.  Frontend Setup (React + Vite)

```
cd ../frontend
npm install
```

- Create a `.env` file inside the `frontend/` folder and add:

```bash
    VITE_API_URL=http://localhost:5555
```

- Start the Frontend Dev Server

```bash
  npm run dev
```

## Contact details

email : `faeynkarichia@gmail.com`

## License

This project is licensed under the [MIT License](./LICENSE) You may use, modify, and distribute this software freely, with proper attribution.
