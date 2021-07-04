const puppeteer = require('puppeteer');

const memberCounterSpan = '.p-huddle_activity__member_count_text';

module.exports = new (class SlackTab {
    async open() {
        this.browser = await puppeteer.launch({
            headless: false,
            executablePath: process.env.EXECUTABLE,
            userDataDir: '.data/slack',
            args: [ '--use-fake-ui-for-media-stream' ]
        });
        this.page = await this.browser.newPage();
        await this.page.goto(process.env.SLACK_CHANNEL_URL);
        
        await this.page.waitFor(3*1000);

        
        await this.page.exposeFunction('puppeteerHuddleMutation', () => {
            this.decidePlayPause();
        });

        await this.page.evaluate(() => {
            const target = document.querySelector('.p-huddle_sidebar_footer');
            const observer = new MutationObserver( mutations => {
                puppeteerHuddleMutation();
            });
            observer.observe(target, { childList: true });
        });
        
        await this.decidePlayPause();
    }
    close() {
        return this.browser.close();
    }
    decidePlayPause() {
        const checkbox = await this.page.$('#huddle_toggle');
        const personCount = await this.page.$('.p-huddle_activity__member_count_text');

        const isInHuddle = await (await checkbox.getProperty('checked')).jsonValue();
        const personCountText = personCount && await (await personCount.getProperty('innerText')).jsonValue();

        let personCount;

        try {
            personCount = Number(personCountText.split(" ")[0]);
        } catch {

        }

        if (isInHuddle) {
            if (personCount && personCount > 1) {
                // Great, do nothing!
            } else {
                // Time to leave!
                await this.page.click('#huddle_toggle');
            }
        } else {
            if (personCount && personCount > 1) {
                // Time to join
                await this.page.click('#huddle_toggle');
            } else {
                // Great, do nothing!
            }
        }
    
    }
})();