document.addEventListener('DOMContentLoaded', () => {
    // Select various elements from the DOM for interaction
    const baseCurrencySelect = document.getElementById('base-currency'); // Get the base currency select element
    const targetCurrencySelect = document.getElementById('target-currency'); // Get the target currency select element
    const amountInput = document.getElementById('amount'); // Get the input element for amount
    const convertedAmountSpan = document.getElementById('converted-amount'); // Get the span element to display converted amount
    const historicalRatesBtn = document.getElementById('historical-rates'); // Get the button element for historical rates
    const historicalRatesContainer = document.getElementById('historical-rates-container'); // Get the container to display historical rates
    const saveFavoriteBtn = document.getElementById('save-favorite'); // Get the button element to save favorite currency pair
    const favoriteCurrencyPairsDiv = document.getElementById('favorite-currency-pairs'); // Get the div to display favorite currency pairs

    // API key and base URL for the currency API
    const apiKey = 'fca_live_t4a5lXL2CPMqZnYq1WZOWNanCQNNkWnSePT1NbJf';
    const apiBaseURL = 'https://api.freecurrencyapi.com/v1';

    // Function to fetch and populate currency options
    const fetchCurrencies = () => {
        fetch(`${apiBaseURL}/currencies?apikey=${apiKey}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const currencies = Object.keys(data.data);
                currencies.forEach(currency => {
                    const option = document.createElement('option'); // Create an option element
                    option.value = currency; // Set the value of the option element
                    option.textContent = currency; // Set the text content of the option element
                    baseCurrencySelect.appendChild(option.cloneNode(true)); // Append the option to base currency select
                    targetCurrencySelect.appendChild(option.cloneNode(true)); // Append the option to target currency select
                });
            })
            .catch(error => {
                console.error('Error fetching currencies:', error);
            });
    };

    // Function to handle currency conversion
    const convertCurrency = () => {
        const baseCurrency = baseCurrencySelect.value; // Get selected base currency
        const targetCurrency = targetCurrencySelect.value; // Get selected target currency
        const amount = parseFloat(amountInput.value); // Get input amount and convert to float

        if (isNaN(amount) || amount <= 0) {
            convertedAmountSpan.textContent = 'Invalid amount'; // Display error if amount is invalid
            return;
        }

        fetch(`${apiBaseURL}/latest?apikey=${apiKey}&currencies=${targetCurrency}&base_currency=${baseCurrency}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const rate = data.data[targetCurrency]; // Get the exchange rate
                if (rate) {
                    const convertedAmount = (amount * rate).toFixed(2); // Calculate converted amount
                    convertedAmountSpan.textContent = `${convertedAmount} ${targetCurrency}`; // Display converted amount
                } else {
                    convertedAmountSpan.textContent = 'Conversion rate not available'; // Display error if rate is not available
                }
            })
            .catch(error => {
                console.error('Error converting currency:', error);
            });
    };

    // Function to fetch historical exchange rates
    const fetchHistoricalRates = () => {
        console.log('Fetching historical rates...');
        const baseCurrency = baseCurrencySelect.value; // Get selected base currency
        const targetCurrency = targetCurrencySelect.value; // Get selected target currency
        const date = '2024-07-10'; // Use hardcoded date
        const historicalApiURL = `${apiBaseURL}/historical?apikey=${apiKey}&date=${date}&base_currency=${baseCurrency}`;
        console.log('Historical API URL:', historicalApiURL);

        fetch(historicalApiURL)
            .then(response => {
                console.log('Historical rates response:', response);
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(`Network response was not ok: ${response.statusText} - ${JSON.stringify(err)}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('Full historical rates data:', data);
                if (data.data && data.data[date][targetCurrency]) {
                    const rate = data.data[date][targetCurrency]; // Get historical exchange rate
                    historicalRatesContainer.textContent = `Historical exchange rate on ${date}: 1 ${baseCurrency} = ${rate} ${targetCurrency}`; // Display historical rate
                } else {
                    historicalRatesContainer.textContent = 'Historical rate not available'; // Display error if historical rate is not available
                    console.log('Historical rates data:', data.data);
                }
            })
            .catch(error => {
                console.error('Error fetching historical rates:', error);
                historicalRatesContainer.textContent = `Error fetching historical rates: ${error.message}`;
            });
    };

    // Function to save favorite currency pairs
    const saveFavorite = () => {
        const baseCurrency = baseCurrencySelect.value; // Get selected base currency
        const targetCurrency = targetCurrencySelect.value; // Get selected target currency

        console.log('Saving favorite:', baseCurrency, targetCurrency);

        fetch('/api/favorites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ baseCurrency, targetCurrency }) // Send favorite currency pair as JSON
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(favorite => {
                console.log('Saved favorite:', favorite);
                const favoriteButton = document.createElement('button'); // Create button for favorite currency pair
                favoriteButton.textContent = `${favorite.baseCurrency}/${favorite.targetCurrency}`;
                favoriteButton.addEventListener('click', () => {
                    baseCurrencySelect.value = favorite.baseCurrency; // Set base currency to favorite
                    targetCurrencySelect.value = favorite.targetCurrency; // Set target currency to favorite
                    convertCurrency(); // Convert currency
                });
                favoriteCurrencyPairsDiv.appendChild(favoriteButton); // Append button to favorite currency pairs div
            })
            .catch(error => {
                console.error('Error saving favorite:', error);
            });
    };

    // Function to fetch and display favorite currency pairs
    const fetchFavorites = () => {
        fetch('/api/favorites')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(favorites => {
                favorites.forEach(favorite => {
                    const favoriteButton = document.createElement('button'); // Create button for each favorite pair
                    favoriteButton.textContent = `${favorite.baseCurrency}/${favorite.targetCurrency}`;
                    favoriteButton.addEventListener('click', () => {
                        baseCurrencySelect.value = favorite.baseCurrency; // Set base currency to favorite
                        targetCurrencySelect.value = favorite.targetCurrency; // Set target currency to favorite
                        convertCurrency(); // Convert currency
                    });
                    favoriteCurrencyPairsDiv.appendChild(favoriteButton); // Append button to favorite currency pairs div
                });
            })
            .catch(error => {
                console.error('Error fetching favorites:', error);
            });
    };

    // Function to fetch the API status
    const fetchAPIStatus = () => {
        fetch(`${apiBaseURL}/status?apikey=${apiKey}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(status => {
                console.log('API Status:', status); // Log the API status
            })
            .catch(error => {
                console.error('Error fetching API status:', error);
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








