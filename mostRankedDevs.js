const Bluebird = require('bluebird');
const { sumBy } = require('lodash');

const TopList = require('./classes/TopList');
const GithubService = require('./services/GithubService');
const config = require('./config');

// Causes the app to only include the users among the first 50 the search api returns,
// otherwise the search takes considerably longer
const SAFEGUARD = true;

const location = process.argv[2];

/**
 * Constructs a list of users with the highest total stars among their repositories
 *
 * @param location - the user's location (e.g. a city), which is taken from the command line args
 * */
async function query(location) {
    const topList = new TopList();

    let usersPage = 1;

    while (true) {
        const users = await GithubService.search(
            'users',
            `q=language:${config.language} location:${location} repos:>0&page=${usersPage}&per_page=50`
        );

        if (!users || !users.length || (SAFEGUARD && usersPage === 2)) {
            break;
        }

        await Bluebird.map(users, async ({ login: username }) => {
            const totalStars = await fetchTotalStars(username);

            topList.process({
                name: username,
                stars: totalStars,
            });
        }, { concurrency: config.concurrency });

        usersPage++;
    }

    console.log(topList.usernames);
}

/**
 * Searches for all of the user's repositories and calculates a sum total of stars
 *
 * @param username - user's GitHub login
 * */
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

query(location);