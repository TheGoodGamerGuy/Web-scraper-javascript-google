const puppeteer = require('puppeteer');
const https = require('https');
const cheerio = require('cheerio');

async function scrapeAndel(link) {

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(link);

    await page.waitForSelector('.catalog__results');
    const articleElements = await page.$$('.catalog__results article');
    const links = await Promise.all(
        articleElements.map(async(article) => {
            const link = await article.$eval('a', (a) => a.href);
            return link;
        })
    );

    const promises = links.map(async link => {
        const html = await new Promise((resolve, reject) => {
            https.get(link, res => {
                let html = '';
                res.on('data', chunk => {
                    html += chunk;
                });
                res.on('end', () => {
                    resolve(html);
                });
            }).on('error', err => {
                reject(err);
            });
        });
        const $ = cheerio.load(html);

        const title = $('.product__title').text().trim().split('\t')[0];
        const description = $(".product__descr").text().split(/\s*\n\s*/).join().split('\t')[0]
        const text = title + description

        const price = parseInt($('.product__price').first().text().trimStart().trimEnd().split(/\s+/).shift());

        const image = $('.image-collage').find('a').attr("href")
        return { text, price, link, image };
    });

    const results = [];
    for (const { text, price, link, image }
        of await Promise.all(promises)) {
        results.push([text, price, link, image]);
    }

    await browser.close();
    return results;
}

module.exports = { scrapeAndel };