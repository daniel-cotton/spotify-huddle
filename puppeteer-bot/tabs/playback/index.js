const puppeteer = require('puppeteer-core');

module.exports = new (class SlackTab {
    async open() {
        this.browser = await puppeteer.launch();
        this.page = await this.browser.newPage();
        await this.page.goto('http://localhost:8080');
    }
    close() {
        return this.browser.close();
    }
})();