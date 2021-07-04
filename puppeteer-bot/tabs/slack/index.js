const puppeteer = require('puppeteer');

module.exports = new (class SlackTab {
    async open() {
        this.browser = await puppeteer.launch({
            headless: false,
            executablePath: process.env.EXECUTABLE,
            userDataDir: '.data/slack'
        });
        this.page = await this.browser.newPage();
        await this.page.goto(process.env.SLACK_CHANNEL_URL);
        
        await this.page.waitForNavigation();

        await this.page.click('#huddle_toggle');
    }
    close() {
        return this.browser.close();
    }
})();