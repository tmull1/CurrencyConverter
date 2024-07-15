document.addEventListener('DOMContentLoaded', () => {
    const baseCurrencySelect = document.getElementById('base-currency');
    const targetCurrencySelect = document.getElementById('target-currency');
    const amountInput = document.getElementById('amount');
    const convertedAmountSpan = document.getElementById('converted-amount');
    const historicalRatesBtn = document.getElementById('historical-rates');
    const historicalRatesContainer = document.getElementById('historical-rates-container');
    const saveFavoriteBtn = document.getElementById('save-favorite');
    const favoriteCurrencyPairsDiv = document.getElementById('favorite-currency-pairs');

    const apiKey = 'fca_live_t4a5lXL2CPMqZnYq1WZOWNanCQNNkWnSePT1NbJf';
    const apiBaseURL = 'https://api.freecurrencyapi.com/v1';

    // Fetch and populate currency options from /v1/currencies
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
                    const option = document.createElement('option');
                    option.value = currency;
                    option.textContent = currency;
                    baseCurrencySelect.appendChild(option.cloneNode(true));
                    targetCurrencySelect.appendChild(option.cloneNode(true));
                });
            })
            .catch(error => {
                console.error('Error fetching currencies:', error);
            });
    };

    // Handle conversion using /v1/latest
    const convertCurrency = () => {
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;
        const amount = parseFloat(amountInput.value);

        if (isNaN(amount) || amount <= 0) {
            convertedAmountSpan.textContent = 'Invalid amount';
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
                const rate = data.data[targetCurrency];
                if (rate) {
                    const convertedAmount = (amount * rate).toFixed(2);
                    convertedAmountSpan.textContent = `${convertedAmount} ${targetCurrency}`;
                } else {
                    convertedAmountSpan.textContent = 'Conversion rate not available';
                }
            })
            .catch(error => {
                console.error('Error converting currency:', error);
            });
    };

    // Handle historical rates using /v1/historical
    const fetchHistoricalRates = () => {
        console.log('Fetching historical rates...');
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;
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
                    const rate = data.data[date][targetCurrency];
                    historicalRatesContainer.textContent = `Historical exchange rate on ${date}: 1 ${baseCurrency} = ${rate} ${targetCurrency}`;
                } else {
                    historicalRatesContainer.textContent = 'Historical rate not available';
                    console.log('Historical rates data:', data.data);
                }
            })
            .catch(error => {
                console.error('Error fetching historical rates:', error);
                historicalRatesContainer.textContent = `Error fetching historical rates: ${error.message}`;
            });
    };

    // Handle saving favorite currency pairs
    const saveFavorite = () => {
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;

        console.log('Saving favorite:', baseCurrency, targetCurrency);

        fetch('/api/favorites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ baseCurrency, targetCurrency })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(favorite => {
                console.log('Saved favorite:', favorite);
                const favoriteButton = document.createElement('button');
                favoriteButton.textContent = `${favorite.baseCurrency}/${favorite.targetCurrency}`;
                favoriteButton.addEventListener('click', () => {
                    baseCurrencySelect.value = favorite.baseCurrency;
                    targetCurrencySelect.value = favorite.targetCurrency;
                    convertCurrency();
                });
                favoriteCurrencyPairsDiv.appendChild(favoriteButton);
            })
            .catch(error => {
                console.error('Error saving favorite:', error);
            });
    };

    // Fetch and display favorite currency pairs
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
                    const favoriteButton = document.createElement('button');
                    favoriteButton.textContent = `${favorite.baseCurrency}/${favorite.targetCurrency}`;
                    favoriteButton.addEventListener('click', () => {
                        baseCurrencySelect.value = favorite.baseCurrency;
                        targetCurrencySelect.value = favorite.targetCurrency;
                        convertCurrency();
                    });
                    favoriteCurrencyPairsDiv.appendChild(favoriteButton);
                });
            })
            .catch(error => {
                console.error('Error fetching favorites:', error);
            });
    };

    // Fetch API status using /v1/status
    const fetchAPIStatus = () => {
        fetch(`${apiBaseURL}/status?apikey=${apiKey}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(status => {
                console.log('API Status:', status);
            })
            .catch(error => {
                console.error('Error fetching API status:', error);
            });
    };

    // Event listeners
    baseCurrencySelect.addEventListener('change', convertCurrency);
    targetCurrencySelect.addEventListener('change', convertCurrency);
    amountInput.addEventListener('input', convertCurrency);
    historicalRatesBtn.addEventListener('click', fetchHistoricalRates);
    saveFavoriteBtn.addEventListener('click', saveFavorite);

    // Initialize
    fetchCurrencies();
    fetchFavorites();
    fetchAPIStatus();
});







