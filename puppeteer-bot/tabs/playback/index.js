const puppeteer = require('puppeteer');

module.exports = new (class SlackTab {
    async open() {
        this.browser = await puppeteer.launch({
            headless: false,
            executablePath: process.env.EXECUTABLE,
            args: [ '--autoplay-policy=no-user-gesture-required' ],
            ignoreDefaultArgs: ["--mute-audio", "--hide-scrollbars"]
        });
        this.page = await this.browser.newPage();
        await this.page.goto('http://localhost:8080');
    }
    close() {
        return this.browser.close();
    }
})();