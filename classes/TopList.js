const { remove, minBy } = require('lodash');

const config = require('../config');

module.exports = class TopList {
    constructor() {
        this.users = [];
    }

    get usernames() {
        return this.users.map(e => e.name)
            .join('\n');
    }

    doesUserBelong(newUser) {
        return this.users.some(user => {
            return user.stars < newUser.stars;
        });
    }

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