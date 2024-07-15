const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Sequelize and define the Favorite model
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite'
});

const Favorite = sequelize.define('Favorite', {
    baseCurrency: {
        type: DataTypes.STRING,
        allowNull: false
    },
    targetCurrency: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

// Sync the database
sequelize.sync().then(() => {
    console.log('Database synced');
}).catch(error => {
    console.error('Error syncing database:', error);
});

// Middleware to parse JSON bodies
app.use(express.json());

// API endpoint to fetch favorite currency pairs
app.get('/api/favorites', async (req, res) => {
    try {
        const favorites = await Favorite.findAll();
        res.json(favorites);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint to add a favorite currency pair
app.post('/api/favorites', async (req, res) => {
    try {
        const { baseCurrency, targetCurrency } = req.body;
        const favorite = await Favorite.create({ baseCurrency, targetCurrency });
        res.json(favorite);
    } catch (error) {
        console.error('Error adding favorite:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Catch-all route to handle 404 for API requests
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Catch-all route to handle 404 for non-API requests
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});



