const puppeteer = require('puppeteer');

module.exports = new (class SlackTab {
    async open() {
        this.browser = await puppeteer.launch();
        this.page = await this.browser.newPage();
        await this.page.goto(process.env.SLACK_CHANNEL_URL);            
    }
    close() {
        return this.browser.close();
    }
})();