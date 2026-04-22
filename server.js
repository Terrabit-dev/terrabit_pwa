const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const options = {
    cert: fs.readFileSync(path.join(__dirname, 'certs', 'fullchain.cer')),
    key:  fs.readFileSync(path.join(__dirname, 'certs', 'privkey.key')),
};

app.prepare().then(() => {
    createServer(options, (req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    }).listen(443, (err) => {
        if (err) throw err;
        console.log('> Terrabit PWA corriendo en https://localhost');
    });
});