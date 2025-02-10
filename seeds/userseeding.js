const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const mongoose = require("mongoose");
const user = require('../models/user');

// MongoDB connection
mongoose
    .connect("mongodb://127.0.0.1:27017/gatoDB")
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Failed to connect to MongoDB", err));


const seedUsers = async () => {
    try {
        // Clear the existing users
        // await User.deleteMany();

        const users = [];

        for (let i = 0; i < 50; i++) {
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            let username = `@${faker.internet.username(firstName, lastName)}`;
            if (username.length > 20) {
                username = username.substring(0, 20);
            }
            const email = faker.internet.email(firstName, lastName);
            const password = await bcrypt.hash("password123", 10); // Default password for all users

            users.push({
                firstName,
                lastName,
                username,
                email,
                password,
                profilePicture: faker.image.avatar(), // Optional profile picture
                createdAt: faker.date.past(),
            });
        }

        // Insert fake users into the database
        await User.insertMany(users);

        console.log("50 fake users successfully added to the database!");
        process.exit();
    } catch (err) {
        console.error("Error seeding the database", err);
        process.exit(1);
    }
};

seedUsers();