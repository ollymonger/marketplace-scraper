import { match } from "assert";

const puppeteer = require('puppeteer');

const openPage = async () => {
    const browser = await puppeteer.launch();
    console.log("marketplace-scraper is starting....");
    const page = await browser.newPage();
    console.log("process started");

    try {
        console.log("attempting to get url");
        await page.goto(process.argv[3].toString());
        
        console.log("data load delay 1.5seconds")
        await page.waitForTimeout(1500);
        console.log("market page loaded fully");
        
        const price = await page.evaluate(() => {
            const el = document.getElementById('market_commodity_forsale');

            const itemName = document.getElementById('largeiteminfo_item_name')?.textContent

            const price = el?.lastElementChild?.textContent

            const amount = el?.firstElementChild?.textContent

            const regexPrice = price?.replace(/((USD)|(\$))/,'')
            if(price != null && amount != null) return { itemName, quantity: amount,currency:'USD', value: regexPrice }

            const newEl = document.getElementById('searchResultsRows');

            const child = newEl?.children[1].getElementsByClassName('market_listing_price market_listing_price_with_fee')[0].textContent

            const newAmount = document.getElementById('searchResults_total')?.textContent;

            if(child != null) {
                const noWhiteSpace = child.trimStart()
                const regexCurrency = noWhiteSpace.match(/(pуб|£|USD|¥|zł|NT|A|AED|\$)/gm)
                const value = noWhiteSpace.replace(/[\t]/g,'').replace(/(pуб.|£|USD|¥|zł|NT| |AED|A|\$)/gm, '').replace(/(--)/,'0')
                return { itemName, amount: newAmount, regexCurrency, value }
            }
        })
       
        // const sp = await page.$x('//*[contains(@class, "market_commodity_orders_header_promote")]')
        // console.log(sp);

        console.log(price);

        await browser.close()
    } catch (e) {
        console.error(e);
    }
}

openPage()