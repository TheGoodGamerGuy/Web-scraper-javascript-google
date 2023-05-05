const https = require('https');
const cheerio = require('cheerio');

async function scrapeSS(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let html = '';
            res.on('data', (chunk) => {
                html += chunk;
            });
            res.on('end', () => {
                const $ = cheerio.load(html);

                const results = [];
                $('a.am').each((i, el) => {
                    const link = $(el).attr('href');
                    const title = $(el).first().text().split(/\s*\n\s*/).join();
                    const parent = $(el).parent().parent().parent();
                    const pricetext = parent.find('.msga2-o').text().replace(",", "")
                    const price = parseInt(pricetext)
                    const image = parent.find("img").attr("src")
                    const fullLink = `https://www.ss.com${link}`;
                    results.push([title, price, fullLink, image]);
                });

                resolve(results)

            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

module.exports = { scrapeSS };