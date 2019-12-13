const axios = require('axios');

const config = require('../config');

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
    static async search(type, query) {
        return abuseDetectionHandler(() => {
            return axios.get(`${config.apiUrl}/${type}?${encodeURI(query)}`, {
                headers: {'Authorization': `token ${config.authToken}`}
            })
        });
    }
};