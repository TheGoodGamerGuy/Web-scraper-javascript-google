const { getLinks, getKeywords, addListings, searchDatabaseLinks } = require('../google/google_sheets');
const { scrapeAndel } = require('../websites/andele');
const { scrapeSS } = require('../websites/ss');
const { scrapeSkelbiu } = require('../websites/skelbiu');
const Fuse = require('fuse.js');

async function scrapeWebsites() {
    const links = await getLinks();

    let everything = []
    for (const link of links) {
        if (link.includes('andelemandele.lv')) {
            const results = await scrapeAndel(link);
            everything = everything.concat(results)
        } else if (link.includes('ss.com')) {
            const results = await scrapeSS(link);
            everything = everything.concat(results)
        } else if (link.includes('skelbiu.lt')) {
            const results = await scrapeSkelbiu(link);
            everything = everything.concat(results)
        }
    }
    return everything
}

async function checkLinks(everything, links) {
    let newEverything = []
    for (let i = 0; i < everything.length; i++) {
        const link = everything[i][2]
        if (links.includes(link)) {
            continue
        } else {
            newEverything.push(everything[i])
        }
    }
    return newEverything
}

async function matchListings(everything, searchItems) {
    const matchedEverything = [];

    for (const searchItem of searchItems) {
        const [keyword, price] = searchItem;
        for (const listing of everything) {
            const [text, listingPrice] = listing;
            if (text.toLowerCase().includes(keyword.toLowerCase()) && listingPrice <= price) {
                listing[0] = keyword;
                matchedEverything.push(listing);
            }
        }
    }

    return matchedEverything;
}


async function matchApproximateListings(everything, searchItems) {
    const matchedEverything = [];

    for (const searchItem of searchItems) {
        const [keyword, price] = searchItem;

        const fuse = new Fuse(everything, { keys: ['0'], threshold: 0.2 });

        const results = fuse.search(keyword);

        for (const result of results) {
            const [text, listingPrice] = result.item;
            if (listingPrice <= price) {
                result.item[0] = keyword;
                matchedEverything.push(result.item);
            }
        }
    }

    return matchedEverything;
}




async function addSomeListings(searchType) {
    const everything = await scrapeWebsites()

    if (searchType == 'precise') {
        const links = await searchDatabaseLinks('Database (precise)!C2:C')
        const searchItems = await getKeywords('Keywords (precise)!A2:B')
        const matchedEverything = await matchListings(everything, searchItems)
        const checkedEverything = await checkLinks(matchedEverything, links)
        await addListings(checkedEverything, 'Database (precise)!A2:A2')
    } else if (searchType == 'broad') {
        const links = await searchDatabaseLinks('Database (broad)!C2:C')
        const searchItems = await getKeywords('Keywords (broad)!A2:B')
        const matchedEverything = await matchListings(everything, searchItems)
        const checkedEverything = await checkLinks(matchedEverything, links)
        await addListings(checkedEverything, 'Database (broad)!A2:A2')
    } else if (searchType == 'approximate') {
        const links = await searchDatabaseLinks('Database (approximate)!C2:C')
        const searchItems = await getKeywords('Keywords (precise)!A2:B')
        const matchedEverything = await matchApproximateListings(everything, searchItems)
        const checkedEverything = await checkLinks(matchedEverything, links)
        await addListings(checkedEverything, 'Database (approximate)!A2:A2')
    } else if (searchType == 'everything') {
        const links = await searchDatabaseLinks('Database (everything)!C2:C')
        const everything = await scrapeWebsites()
        const checkedEverything = await checkLinks(everything, links)
        await addListings(checkedEverything, 'Database (everything)!A2:A2')
    } else {
        return "are you dumb?"
    }

    return "success!, maybe..."
}

async function addAllListings() {
    const everything = await scrapeWebsites()

    const preciseLinks = await searchDatabaseLinks('Database (precise)!C2:C')
    const preciseSearchItems = await getKeywords('Keywords (precise)!A2:B')
    const preciseMatchedEverything = await matchListings(everything, preciseSearchItems)
    const preciseCheckedEverything = await checkLinks(preciseMatchedEverything, preciseLinks)
    await addListings(preciseCheckedEverything, 'Database (precise)!A2:A2')

    const broadLinks = await searchDatabaseLinks('Database (broad)!C2:C')
    const broadSearchItems = await getKeywords('Keywords (broad)!A2:B')
    const broadMatchedEverything = await matchListings(everything, broadSearchItems)
    const broadCheckedEverything = await checkLinks(broadMatchedEverything, broadLinks)
    await addListings(broadCheckedEverything, 'Database (broad)!A2:A2')

    const approximateLinks = await searchDatabaseLinks('Database (approximate)!C2:C')
    const approximateSearchItems = await getKeywords('Keywords (precise)!A2:B')
    const approximateMatchedEverything = await matchApproximateListings(everything, approximateSearchItems)
    const approximateCheckedEverything = await checkLinks(approximateMatchedEverything, approximateLinks)
    await addListings(approximateCheckedEverything, 'Database (approximate)!A2:A2')

    const everythingLinks = await searchDatabaseLinks('Database (everything)!C2:C')
    const everythingCheckedEverything = await checkLinks(everything, everythingLinks)
    await addListings(everythingCheckedEverything, 'Database (everything)!A2:A2')


    return "success!, maybe..."
}


module.exports = { addSomeListings, addAllListings };