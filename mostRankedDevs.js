const Bluebird = require('bluebird');
const { sumBy } = require('lodash');

const Top3 = require('./classes/Top3');
const GithubService = require('./services/GithubService');
const config = require('./config');

// Causes the app to only include the users among the first 50 the search api returns,
// otherwise the search takes considerably longer
const SAFEGUARD = true;

const city = process.argv[2];

async function query(city) {
    const top3 = new Top3();

    let usersPage = 1;

    while (true) {
        const users = await GithubService.search(
            'users',
            `q=language:${config.language} location:${city} repos:>0&page=${usersPage}&per_page=50`
        );

        if (!users || !users.length || (SAFEGUARD && usersPage === 2)) {
            break;
        }

        await Bluebird.map(users, async ({ login: username }) => {
            const totalStars = await fetchTotalStars(username);

            top3.process({
                name: username,
                stars: totalStars,
            });
        }, { concurrency: config.concurrency });

        usersPage++;
    }

    console.log(top3.usernames);
}

async function fetchTotalStars(username) {
    let totalStars = 0;
    let reposPage = 1;

    while (true) {
        const repos = await GithubService.search(
            'repositories',
            `q=user:${username} language:${config.language} stars:>0&page=${reposPage}&per_page=100`
        );

        if (!repos || !repos.length) {
            break;
        }

        totalStars += sumBy(repos, repo => repo.stargazers_count);

        reposPage++;
    }

    return totalStars;
}

query(city);