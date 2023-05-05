const { google } = require('googleapis');
const serviceAccount = require('./united-sunbeam-333716-06b9df929ffa.json');

const spreadsheetId = '1U5EKF54nmgTfP2vS7cO66E9q1HpmwJ03zhloiKMt0P0'

const sheets = google.sheets({
    version: 'v4',
    auth: new google.auth.JWT(
        serviceAccount.client_email,
        null,
        serviceAccount.private_key, ['https://www.googleapis.com/auth/spreadsheets']
    ),
});

async function getLinks() {
    return new Promise((resolve, reject) => {
        sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: 'Website links!A2:A',
        }, (err, response) => {
            if (err) {
                console.error('The API returned an error:', err);
                reject(err);
            } else {
                const values = response.data.values;
                const list = values.map(row => row[0]);
                resolve(list);
            }
        });
    });
}

async function getKeywords(range) {
    return new Promise((resolve, reject) => {
        sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: range,
        }, (err, response) => {
            if (err) {
                console.error('The API returned an error:', err);
                reject(err);
            } else {
                const values = response.data.values;
                const list = values.map(row => [row[0], row[1]]);
                resolve(list);
            }
        });
    });
}

async function searchDatabaseLinks(range) {
    return new Promise((resolve, reject) => {
        sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: range,
        }, (err, response) => {
            if (err) {
                console.error('The API returned an error:', err);
                reject(err);
            } else {
                const values = response.data.values;
                const list = values.map(row => row[0]);
                resolve(list);
            }
        });
    });
}


async function addListings(data, range) {
    sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: range,
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: data,
        },
    }, (err, response) => {
        if (err) {
            console.error('The API returned an error:', err);
            return;
        }
        console.log(`${response.data.updates.updatedCells} cells appended.`);
        console.log(response.data);
    });
}


module.exports = { getLinks, getKeywords, searchDatabaseLinks, addListings }