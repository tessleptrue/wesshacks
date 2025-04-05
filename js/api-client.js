/**
 * WesShacks API Client
 * A JavaScript library for interacting with the WesShacks REST API
 */

class WesShacksAPI {
    constructor(baseUrl = '') {
        this.baseUrl = baseUrl || window.location.origin;
        this.token = localStorage.getItem('wesshacks_token') || null;
    }

    /**
     * Set the authentication token
     * @param {string} token - JWT or API token
     */
    setToken(token) {
        this.token = token;
        localStorage.setItem('wesshacks_token', token);
    }

    /**
     * Clear the authentication token
     */
    clearToken() {
        this.token = null;
        localStorage.removeItem('wesshacks_token');
    }

    /**
     * Make an API request
     * @param {string} endpoint - API endpoint
     * @param {string} method - HTTP method
     * @param {object} data - Request data
     * @returns {Promise} - API response
     */
    async request(endpoint, method = 'GET', data = null) {
        const url = `${this.baseUrl}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        // Add authentication token if available
        if (this.token) {
            options.headers['Authorization'] = `Bearer ${this.token}`;
        }

        // Add request body for POST/PUT/PATCH requests
        if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'API request failed');
            }

            return responseData;
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }

    // Houses endpoints
    async getHouses(params = {}) {
        const queryParams = new URLSearchParams(params).toString();
        return this.request(`/api/houses.php${queryParams ? '?' + queryParams : ''}`);
    }

    async getHouse(houseAddress) {
        return this.request(`/api/houses.php?id=${encodeURIComponent(houseAddress)}`);
    }

    // Reviews endpoints
    async getReviews(params = {}) {
        const queryParams = new URLSearchParams(params).toString();
        return this.request(`/api/reviews.php${queryParams ? '?' + queryParams : ''}`);
    }

    async getHouseReviews(houseAddress) {
        return this.request(`/api/reviews.php?house=${encodeURIComponent(houseAddress)}`);
    }

    async submitReview(reviewData) {
        return this.request('/api/reviews.php', 'POST', reviewData);
    }

    async deleteReview(reviewId) {
        return this.request(`/api/reviews.php?id=${reviewId}`, 'DELETE');
    }

    // User endpoints
    async login(username, password) {
        const response = await this.request('/api/users.php', 'POST', {
            action: 'login',
            username,
            password
        });

        if (response.status === 'success' && response.token) {
            this.setToken(response.token);
        }

        return response;
    }

    async register(username, password, email) {
        const response = await this.request('/api/users.php', 'POST', {
            action: 'register',
            username,
            password,
            email
        });

        if (response.status === 'success' && response.token) {
            this.setToken(response.token);
        }

        return response;
    }

    async logout() {
        const response = await this.request('/api/users.php', 'POST', {
            action: 'logout'
        });
        this.clearToken();
        return response;
    }

    async getUserInfo() {
        return this.request('/api/users.php');
    }
}

// Create a global instance for easy access
window.wesshacksAPI = new WesShacksAPI();