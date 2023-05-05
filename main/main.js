const { addSomeListings, addAllListings } = require('./processing/searching')

// addSomeListings('everything')
//     .then(data => console.log(data))

addAllListings()
    .then(data => console.log(data))