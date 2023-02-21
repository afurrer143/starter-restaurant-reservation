# Restaurant Reservation System


This is a full stack application to create a reservation system for a dine-in restaurant. The application allows a hostess to seat customers and create reservations.

## Live preview and screenshots

Live Site is at [here](https://restaurant-frontend-5eh3.onrender.com/)

### Dashboard

![image of dashboard](/screenshots/dashboard.png)

### Seating Reservation

![image of seating page](/screenshots/seating.png)

### Creating New Reservation

![image of new reservation page](/screenshots/newReservation.png)

### Search page

![image of search page with no input](/screenshots/searchEmpty.png)

![image of search page](/screenshots/search.png)

## Technologies Used

+ React.js for the front-end
+ PostgreSQL database for data storage
+ Knex.js for the back-end


## Getting Started

To get started with this project, you will need to follow these steps:

1. Create at least one postgreSQL database (up to four for testing, dev, preview, prod)
2. Clone this repository to your local machine
3. Install the necessary dependencies using the command npm install
4. Run `cp ./back-end/.env.sample ./back-end/.env`
5. Update the `.back-end/.env` file with the connection URL to your own postgreSQL database(s)
6. Run `cp ./front-end/.env.sample ./front-end/.env` You only need to edit this file if you need to connect to a backend location other than `http://localhost:5001` which is the default port for the backend
6. Start the application using the command `npm start` or `npm run start:dev`

## Features

This application allows a hostess to:

+ Create new reservations
+ Edit existing reservations
+ View a list of reservations for a given day
+ Seat customers at a table
+ View a list of available tables
+ Search for reservations by name or phone number

## Usage

To use this application, simply navigate to the URL where the application is hosted. From there, you can create new reservations, view a list of reservations for a given day, and more.

## Database Schema

The database schema for this application includes the following tables:

+ reservations
+ tables

The reservations table includes the following fields:

+ reservation_id (primary key)
+ first_name
+ last_name
+ mobile_number
+ reservation_date
+ reservation_time
+ people
+ status

The tables table includes the following fields:

+ table_id (primary key)
+ table_name
+ capacity
+ reservation_id (optional foreign key)

## Contributing

If you would like to contribute to this project, please open a pull request with your changes.