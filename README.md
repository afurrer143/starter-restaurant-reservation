# Restaurant Reservation System


This is a full stack application to create a reservation system for a dine-in restaurant. The application allows a hostess to seat customers and create reservations.

## Technologies Used

+ React.js for the front-end
+ PostgreSQL database for data storage
+ Knex.js for the back-end


## Getting Started

To get started with this project, you will need to follow these steps:

1. Clone this repository to your local machine
2. Install the necessary dependencies using the command npm install
3. Start the application using the command npm start

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