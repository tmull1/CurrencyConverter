document.addEventListener('DOMContentLoaded', () => {
    // Select various elements from the DOM for interaction
    const baseCurrencySelect = document.getElementById('base-currency'); // Get the base currency select element by its ID
    const targetCurrencySelect = document.getElementById('target-currency'); // Get the target currency select element by its ID
    const amountInput = document.getElementById('amount'); // Get the input element for amount by its ID
    const convertedAmountSpan = document.getElementById('converted-amount'); // Get the span element to display converted amount by its ID
    const historicalRatesBtn = document.getElementById('historical-rates'); // Get the button element for historical rates by its ID
    const historicalRatesContainer = document.getElementById('historical-rates-container'); // Get the container to display historical rates by its ID
    const saveFavoriteBtn = document.getElementById('save-favorite'); // Get the button element to save favorite currency pair by its ID
    const favoriteCurrencyPairsDiv = document.getElementById('favorite-currency-pairs'); // Get the div to display favorite currency pairs by its ID

    // API key and base URL for the currency API
    const apiKey = 'fca_live_t4a5lXL2CPMqZnYq1WZOWNanCQNNkWnSePT1NbJf'; // API key for authentication
    const apiBaseURL = 'https://api.freecurrencyapi.com/v1'; // Base URL for the currency API

    // Function to fetch and populate currency options
    const fetchCurrencies = () => {
        fetch(`${apiBaseURL}/currencies?apikey=${apiKey}`) // Fetch the list of currencies from the API
            .then(response => {
                if (!response.ok) { // Check if the response is not OK
                    throw new Error('Network response was not ok'); // Throw an error if response is not OK
                }
                return response.json(); // Parse the JSON response
            })
            .then(data => {
                const currencies = Object.keys(data.data); // Get the keys (currency codes) from the data object
                currencies.forEach(currency => {
                    const option = document.createElement('option'); // Create an option element for each currency
                    option.value = currency; // Set the value of the option element to the currency code
                    option.textContent = currency; // Set the text content of the option element to the currency code
                    baseCurrencySelect.appendChild(option.cloneNode(true)); // Append the option to base currency select
                    targetCurrencySelect.appendChild(option.cloneNode(true)); // Append the option to target currency select
                });
            })
            .catch(error => {
                console.error('Error fetching currencies:', error); // Log an error if fetching fails
            });
    };

    // Function to handle currency conversion
    const convertCurrency = () => {
        const baseCurrency = baseCurrencySelect.value; // Get the selected base currency
        const targetCurrency = targetCurrencySelect.value; // Get the selected target currency
        const amount = parseFloat(amountInput.value); // Get the input amount and convert to a floating-point number

        if (isNaN(amount) || amount <= 0) { // Check if the amount is not a number or less than or equal to zero
            convertedAmountSpan.textContent = 'Invalid amount'; // Display error if amount is invalid
            return; // Exit the function
        }

        fetch(`${apiBaseURL}/latest?apikey=${apiKey}&currencies=${targetCurrency}&base_currency=${baseCurrency}`) // Fetch the latest conversion rate
            .then(response => {
                if (!response.ok) { // Check if the response is not OK
                    throw new Error('Network response was not ok'); // Throw an error if response is not OK
                }
                return response.json(); // Parse the JSON response
            })
            .then(data => {
                const rate = data.data[targetCurrency]; // Get the exchange rate for the target currency
                if (rate) { // Check if the rate is available
                    const convertedAmount = (amount * rate).toFixed(2); // Calculate the converted amount and fix to 2 decimal places
                    convertedAmountSpan.textContent = `${convertedAmount} ${targetCurrency}`; // Display the converted amount
                } else {
                    convertedAmountSpan.textContent = 'Conversion rate not available'; // Display error if rate is not available
                }
            })
            .catch(error => {
                console.error('Error converting currency:', error); // Log an error if conversion fails
            });
    };

    // Function to fetch historical exchange rates
    const fetchHistoricalRates = () => {
        console.log('Fetching historical rates...'); // Log the action
        const baseCurrency = baseCurrencySelect.value; // Get the selected base currency
        const targetCurrency = targetCurrencySelect.value; // Get the selected target currency
        const date = '2024-07-10'; // Use hardcoded date for simplicity
        const historicalApiURL = `${apiBaseURL}/historical?apikey=${apiKey}&date=${date}&base_currency=${baseCurrency}`; // Construct the API URL for historical rates
        console.log('Historical API URL:', historicalApiURL); // Log the API URL

        fetch(historicalApiURL) // Fetch the historical rates
            .then(response => {
                console.log('Historical rates response:', response); // Log the response
                if (!response.ok) { // Check if the response is not OK
                    return response.json().then(err => {
                        throw new Error(`Network response was not ok: ${response.statusText} - ${JSON.stringify(err)}`); // Throw an error with details
                    });
                }
                return response.json(); // Parse the JSON response
            })
            .then(data => {
                console.log('Full historical rates data:', data); // Log the full data
                if (data.data && data.data[date][targetCurrency]) { // Check if the data for the date and target currency is available
                    const rate = data.data[date][targetCurrency]; // Get the historical exchange rate
                    historicalRatesContainer.textContent = `Historical exchange rate on ${date}: 1 ${baseCurrency} = ${rate} ${targetCurrency}`; // Display the historical rate
                } else {
                    historicalRatesContainer.textContent = 'Historical rate not available'; // Display error if historical rate is not available
                    console.log('Historical rates data:', data.data); // Log the data
                }
            })
            .catch(error => {
                console.error('Error fetching historical rates:', error); // Log an error if fetching fails
                historicalRatesContainer.textContent = `Error fetching historical rates: ${error.message}`; // Display error message
            });
    };

    // Function to save favorite currency pairs
    const saveFavorite = () => {
        const baseCurrency = baseCurrencySelect.value; // Get the selected base currency
        const targetCurrency = targetCurrencySelect.value; // Get the selected target currency

        console.log('Saving favorite:', baseCurrency, targetCurrency); // Log the action

        fetch('/api/favorites', {
            method: 'POST', // Use POST method to save favorite
            headers: {
                'Content-Type': 'application/json' // Set content type to JSON
            },
            body: JSON.stringify({ baseCurrency, targetCurrency }) // Send favorite currency pair as JSON in the request body
        })
            .then(response => {
                if (!response.ok) { // Check if the response is not OK
                    throw new Error('Network response was not ok'); // Throw an error if response is not OK
                }
                return response.json(); // Parse the JSON response
            })
            .then(favorite => {
                console.log('Saved favorite:', favorite); // Log the saved favorite
                const favoriteButton = document.createElement('button'); // Create a button element for the favorite currency pair
                favoriteButton.textContent = `${favorite.baseCurrency}/${favorite.targetCurrency}`; // Set the text content of the button
                favoriteButton.addEventListener('click', () => {
                    baseCurrencySelect.value = favorite.baseCurrency; // Set base currency to favorite
                    targetCurrencySelect.value = favorite.targetCurrency; // Set target currency to favorite
                    convertCurrency(); // Convert currency using favorite pair
                });
                favoriteCurrencyPairsDiv.appendChild(favoriteButton); // Append button to favorite currency pairs div
            })
            .catch(error => {
                console.error('Error saving favorite:', error); // Log an error if saving fails
            });
    };

    // Function to fetch and display favorite currency pairs
    const fetchFavorites = () => {
        fetch('/api/favorites') // Fetch the favorite currency pairs from the API
            .then(response => {
                if (!response.ok) { // Check if the response is not OK
                    throw new Error('Network response was not ok'); // Throw an error if response is not OK
                }
                return response.json(); // Parse the JSON response
            })
            .then(favorites => {
                favorites.forEach(favorite => {
                    const favoriteButton = document.createElement('button'); // Create a button element for each favorite pair
                    favoriteButton.textContent = `${favorite.baseCurrency}/${favorite.targetCurrency}`; // Set the text content of the button
                    favoriteButton.addEventListener('click', () => {
                        baseCurrencySelect.value = favorite.baseCurrency; // Set base currency to favorite
                        targetCurrencySelect.value = favorite.targetCurrency; // Set target currency to favorite
                        convertCurrency(); // Convert currency using favorite pair
                    });
                    favoriteCurrencyPairsDiv.appendChild(favoriteButton); // Append button to favorite currency pairs div
                });
            })
            .catch(error => {
                console.error('Error fetching favorites:', error); // Log an error if fetching fails
            });
    };

    // Function to fetch the API status
    const fetchAPIStatus = () => {
        fetch(`${apiBaseURL}/status?apikey=${apiKey}`) // Fetch the API status
            .then(response => {
                if (!response.ok) { // Check if the response is not OK
                    throw new Error('Network response was not ok'); // Throw an error if response is not OK
                }
                return response.json(); // Parse the JSON response
            })
            .then(status => {
                console.log('API Status:', status); // Log the API status
            })
            .catch(error => {
                console.error('Error fetching API status:', error); // Log an error if fetching fails
            });
    };

    // Event listeners for various actions
    baseCurrencySelect.addEventListener('change', convertCurrency); // Convert currency when base currency changes
    targetCurrencySelect.addEventListener('change', convertCurrency); // Convert currency when target currency changes
    amountInput.addEventListener('input', convertCurrency); // Convert currency when amount input changes
    historicalRatesBtn.addEventListener('click', fetchHistoricalRates); // Fetch historical rates on button click
    saveFavoriteBtn.addEventListener('click', saveFavorite); // Save favorite currency pair on button click

    // Initialize the app by fetching currencies, favorites, and API status
    fetchCurrencies(); // Fetch and populate currency options
    fetchFavorites(); // Fetch and display favorite currency pairs
    fetchAPIStatus(); // Fetch the API status
});








