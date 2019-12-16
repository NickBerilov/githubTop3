const axios = require('axios');

const config = require('../config');

/**
 * A wrapper for an API call that makes the call again after the amount of time set
 * in the `retry-after` header if abuse detection is triggered
 * */
async function abuseDetectionHandler(callback) {
    let result;

    try {
        result = await callback();
    } catch (err) {
        if (err.response.status === 403) {
            const retryAfter = Number(err.response.headers['retry-after']);

            console.log(`Abuse detection triggered, pausing for ${retryAfter} seconds`);

            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));

            result = await callback();
        }
    }

    return result && result.data && result.data.items;
}

module.exports = class GithubService {
    /**
     * Calls GitHub's search API with the given parameters
     *
     * @param type - type of object to search for (e.g. "users" or "repositories")
     * @param query - search query
     * */
    static async search(type, query) {
        return abuseDetectionHandler(() => {
            return axios.get(`${config.apiUrl}/${type}?${encodeURI(query)}`, {
                headers: {'Authorization': `token ${config.authToken}`}
            })
        });
    }
};