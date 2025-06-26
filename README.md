# Mobile Garage Management System
The Mobile Garage Management System is a full-stack web application designed with love to make garage life easier and more efficient. It allows customers to book vehicle service requests from the comfort of their home—no more waiting in line at the garage.

Once a request is submitted, the admin assigns a qualified mechanic and facilitates smooth communication between the customer and the mechanic.

Meanwhile, admins can oversee service operations, manage mechanics, and track inventory usage behind the scenes ensuring everything runs smoothly.

## Features
* Role-based access for Admins, Mechanics, and Customers

* Customers can submit and monitor service requests

* Mechanics can view assigned tasks and update their status

* Admins can manage users, services, and inventory

* Real-time inventory updates based on part usage

* Fully responsive and user-friendly interface

## Technologies Used
``` Frontend: React, Vite, Tailwind CSS – deployed on Vercel```

``` Backend: Flask, Flask SQLAlchemy, JWT Authentication – deployed on Render ```

``` Database: PostgreSQL – hosted on Neon```

## Live Demo
[ Visit the Live App](https://mobile-garage-management-system-m1ysvf39l.vercel.app/)




## Running Locally
Follow these steps to run the project locally on your machine:

1. Clone the repository
* git clone https://github.com/your-username/mobile-garage-management-system.git
* cd mobile-garage-management-system

2. Backend Setup (Flask)

* cd backend
* python -m venv venv
* source venv/bin/activate
* pip install -r requirements.txt
* Create a .env file and add your environment variables (e.g. DATABASE_URL, JWT_SECRET_KEY, etc.)

* Rin the server ``` flask run ```


3. Frontend Setup (React)
* cd frontend
* npm install
* Create a .env file and define your API URL:


* VITE_API_URL=http://localhost:5555

* npm run dev
4. Access the App
Open your browser and go to:
http://localhost:5173

## License
This project is licensed under the [MIT License](./LICENSE) You may use, modify, and distribute this software freely, with proper attribution.
# created by: FAITH NKARICHIA
## contact details
* faeynkarichia@gmail.com




