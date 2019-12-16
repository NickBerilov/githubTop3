## How to run

`node mostRankedDevs.js \<location\>`  
Example: `node mostRankedDevs.js Minsk`

## Description

Upon execution, the app searches for users from the given location with JavaScript associated with their profile, goes 
over their repositories, calculates a sum total of all stars the repos with JavaScript as the main language have
and constructs a list of the 3 users with the highest total stars.  
The language and the amount of users the app returns upon completion are configurable via the config.json file.

##Limitations

The app has several limitations:
1. GitHub API only allows you to retrieve the first 1000 of all the users the search API returns, which leaves a 
possibility of missing the users that would otherwise be in the top 3.
2. Since the number of calls we need to make to retrieve all users and their repositories, the app takes a while to 
return the result; setting the `SAFEGUARD` variable defined in `mostRankedDevs.js` to `true` causes the app to only 
check the first 50 users, which somewhat mitigates this issue, but also increases the chance of missing a user with a
high amount of total stars. 
3. The app makes a large number of API calls, which sometimes breaks the API's rate limit and triggers "Abuse detection",
which we handle by using the `retry-after` header and waiting for the API to become available again.