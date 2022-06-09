const puppeteer = require('puppeteer');

const getCurrencyFromSymbol = (symbol: string) => {
    switch (symbol) {
        case '$':
            return 'USD';
        case '€':
            return 'EUR';
        case '£':
            return 'GBP';
        case 'zł':
            return 'PLN';
        case 'pуб':
            return 'RUB';
        case '₴':
            return 'UAH';
        case '₦':
            return 'NGN';
        case '₹':
            return 'INR';
        case '₩':
            return 'KRW';
        case '₫':
            return 'VND';
        case '₭':
            return 'LAK';
        case '₮':
            return 'MNT';
        case '₱':
            return 'PHP';
        case '₲':
            return 'PYG';
        case '₸':
            return 'KZT';
        case '¥':
            return 'JPY';
        case 'A':
            return 'AUD';
        case 'AED':
            return 'AED';
        case 'NT':
            return 'TWD';
        default:
            return 'USD';
    }
}

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
            const gameId = window.location.pathname.split('/')[3];
            const itemURL = window.location.pathname;
            const el = document.getElementById('market_commodity_forsale');

            const itemName = document.getElementById('largeiteminfo_item_name')?.textContent

            const price = el?.lastElementChild?.textContent

            const amount = el?.firstElementChild?.textContent

            const regexPrice = price?.replace(/((USD)|(\$))/,'')
            if(price != null && amount != null) return { gameId, itemURL, itemName, amount, currency:'USD', value: regexPrice }

            const newEl = document.getElementById('searchResultsRows');

            const child = newEl?.children[1].getElementsByClassName('market_listing_price market_listing_price_with_fee')[0].textContent

            const newAmount = document.getElementById('searchResults_total')?.textContent;

            if(child != null) {
                const noWhiteSpace = child.trimStart()
                const regexCurrency = noWhiteSpace.match(/(pуб|£|USD|¥|zł|NT|A|AED|€|₸|₴|\$)/gm)
                const value = noWhiteSpace.replace(/[\t]/g,'').replace(/(pуб.|£|USD|¥|zł|NT| |AED|A|€|₸|₴|\$)/gm, '').replace(/(--)/,'0')
                return { gameId, itemURL, itemName, amount: newAmount, regexCurrency, value }
            }
        })
       
        // const sp = await page.$x('//*[contains(@class, "market_commodity_orders_header_promote")]')
        // console.log(sp);
        await browser.close()

        console.log({
            gameId: price.gameId,
            itemURL: price.itemURL,
            itemName: price.itemName,
            quantity: price.amount,
            currency: getCurrencyFromSymbol(price.regexCurrency[0]),
            value: price.value
        })
    } catch (e) {
        console.error(e);
    }
}

openPage()
