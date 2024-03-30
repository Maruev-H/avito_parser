import puppeteer, { Browser, Page } from "puppeteer";

export const LAUNCH_PUPPETEER_OPTS = {
  ignoreHTTPSErrors: true,
  args: [
    "--unlimited-storage",
    "--full-memory-crash-report",
    "--disable-gpu",
    "--ignore-certificate-errors",
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--lang=en-US;q=0.9,en;q=0.8",
    "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  ],
};

export const PAGE_PUPPETEER_OPTS = {
  networkIdle2Timeout: 5_000 * 1.5,
  waitUntil: "networkidle2",
  timeout: 1000 * 60 * 1.5,
};

class PuppeteerHandler {
  browser: Browser
  pagePool: Page[]
  isBrowserClosed: boolean

  constructor() {
    this.browser = null;
    this.pagePool = [];
  }

  async initBrowser() {
    this.browser = await puppeteer.launch(LAUNCH_PUPPETEER_OPTS);
    this.browser.on('disconnected', () => {
      console.log('Browser disconnected');
      this.isBrowserClosed = true;
      this.browser = null;
    });
  }

  async ensureBrowser() {
    if (!this.browser || this.isBrowserClosed) {
      await this.initBrowser();
      this.isBrowserClosed = false;
    }
  }

  async getPage() {
    
    await this.ensureBrowser();

    if (this.pagePool.length > 0) {
      return this.pagePool.pop();
    } else {
      const page = await this.browser.newPage();
      return page;
    }
  }

  async releasePage(page: Page) {
    await page.setViewport({ width: 1366, height: 768 });
    await page.goto("about:blank");
    this.pagePool.push(page);
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async getPageContent(url: string) {
    const page = await this.getPage();
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      await page.goto(url, PAGE_PUPPETEER_OPTS);
      const content = await page.content();
      return { content, page };
    } catch (err) {
      this.releasePage(page);
      throw err;
    }
  }
}

export default new PuppeteerHandler()
