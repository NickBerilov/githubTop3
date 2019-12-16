const { remove, minBy } = require('lodash');

const config = require('../config');

module.exports = class TopList {
    constructor() {
        this.users = [];
    }

    /**
     * Returns a console-friendly list of usernames of all users currently on the list
     * */
    get usernames() {
        return this.users.map(e => e.name)
            .join('\n');
    }

    /**
     * Checks if the user's star count is higher than that of any other user currently on the list
     *
     * @param newUser - the user object
     * @param newUser.name - user's username
     * @param newUser.stars - user's total amount of stars
     * */
    doesUserBelong(newUser) {
        return this.users.some(user => {
            return user.stars < newUser.stars;
        });
    }

    /**
     * Puts the users on the list if they belong there
     *
     * @param newUser - the user object
     * @param newUser.name - user's username
     * @param newUser.stars - user's total amount of stars
     * */
    process(newUser) {
        if (this.users.length < config.topListUserCount) {
            this.users.push(newUser);
        } else if (this.doesUserBelong(newUser)) {
            const userToRemove = minBy(this.users, 'stars');
            remove(this.users, user => user.name === userToRemove.name);
            this.users.push(newUser);
        }
    }
};