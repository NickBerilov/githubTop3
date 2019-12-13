const { remove, minBy } = require('lodash');

module.exports = class Top3 {
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
        if (this.users.length < 3) {
            this.users.push(newUser);
        } else if (this.doesUserBelong(newUser)) {
            const userToRemove = minBy(this.users, 'stars');
            remove(this.users, user => user.name === userToRemove.name);
            this.users.push(newUser);
        }
    }
};