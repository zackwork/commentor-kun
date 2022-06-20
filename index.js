const puppeteer = require("puppeteer-extra")
const cheerio = require('cheerio')
const fs = require("fs/promises")
const fsr = require("fs")
const StealthPlugin = require("puppeteer-extra-plugin-stealth")
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker")
const randomUseragent = require('random-useragent');
puppeteer.use(StealthPlugin())
puppeteer.use(AdblockerPlugin())

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36';

start();

async function start(){

	let linksToVisit = [];
	let rawdata = fsr.readFileSync('visitedlinks.json');
	let visitedLinks = JSON.parse(rawdata);


	


	const browser = await puppeteer.launch({ 
		headless: true,
		executablePath: process.env.CHROME_BIN || null,
		userDataDir: "user_data",
		args: ['--enable-features=NetworkService', '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
		ignoreHTTPSErrors: true, 
		dumpio: false 
	});

	const page = await browser.newPage();
	const userAgent = randomUseragent.getRandom();
	const UA = userAgent || USER_AGENT;
	await page.setViewport({ 
		width: 1366, 
		height: 657,
		deviceScaleFactor: 1,
		hasTouch: false,
		isLandscape: false,
		isMobile: false
	});
	await page.setUserAgent(UA);
	await page.setJavaScriptEnabled(true);
	
	await page.goto("https://kunmanga.com/", {
		waitUntil: 'networkidle2'
	})

	await page.click("#navigation-ajax");

	await delay(5000);
	
	// await page.screenshot({ path: "done.png" })
	const mangaLinks = await page.evaluate(() => {
		return Array.from(document.querySelectorAll(".post-title a")).map(x => x.href)
	})

	const chapterLinks = await page.evaluate(() => {
		return Array.from(document.querySelectorAll(".chapter .btn-link")).map(x => x.href)
	})

	linksToVisit = mangaLinks.concat(chapterLinks);

	const loginselector = '.site-header .c-sub-header-nav .c-sub-nav_wrap .c-modal_item .btn-active-modal';
	const needsLogin = await page.$(loginselector);

	if (needsLogin) {
		await page.click(loginselector);
		await delay(10000);
		await page.type(".input.user_login", "emeral");
		await page.type(".input.user_pass", "12345678tv");
		await page.click("#rememberme");
		await delay(3000);
		await page.click("#loginform .wp-submit");
		await delay(8000);
	}


	while(linksToVisit.length > 0){
		const currentUrl = linksToVisit.pop();
		if(visitedLinks.includes(currentUrl)) continue;

		await page.goto(currentUrl, {
			waitUntil: 'networkidle2'
		});




		const textArr = [
		"Attention: We give 10 people the chance to win a MacBook Pro every day \r\n Excited about winning exclusive prizes like AirPods, PS5, Galaxy S22 Ultra and iPhone 13 Pro! \r\n Check our website daily for a chance to win for Free! \r\n Goto https://bit.ly/freebiesio and Enter Now!", 
		"Attention: If you are looking for a freebie website where you can win free stuff like the Macbook Pro and the iPhone 13 Pro, then the FREEBIES OFFERWALL  Is your best choice. \r\n If you are interested in winning prizes like this, then visit: https://bit.ly/freebiesio and enter their contest today.", 
		"Attention: This site offers a chance to win free prizes. \r\n You can win freebies from Amazon, Apple, Best Buy, Macy's, Nordstrom, Overstock.com, Sears, Wayfair…and more! \r\n Visit https://bit.ly/freebiesio To  Enter their contest now and win the prize. \r\n It’s Free!", 
		"Attention: How would you like a chance to win one of the best prizes that money can buy? \r\n Macbook Pro, iPhone 13 Pro, Galaxy 22 Ultra, PS5 or other best branded gadgets. \r\n Visit https://bit.ly/freebiesio To Enter now!", 
		"Attention: I want you to try your luck and enter our contest. \r\n What prize would you like to win? Apple iPhone 13 Pro, Galaxy S22 Ultra or PS5? Macbook Pro? \r\n Feel amazing about the prizes You can win?. \r\n Test your luck with us and goto https://bit.ly/freebiesio  To enter our contest."
		];


		const randomNumber = Math.floor(Math.random()*textArr.length);

		await page.$eval('#comment', el => el.scrollIntoView());
		await page.type('#comment', textArr[randomNumber]);
		await page.click("#submit");
		await delay(8000);

		const errorPage = '#error-page';
		const needsSkip = await page.$(errorPage);
		if(!needsSkip){
		 visitedLinks.push(currentUrl);
		}


		


	}

	await page.screenshot({ path: "done.png" })


	const jsonManga = JSON.stringify(visitedLinks, null, 4);
	await fs.writeFile("visitedlinks.json", jsonManga);
	await browser.close();

}




// Duplicate comment detected; it looks as though you’ve already said that!



function delay(time){
	return new Promise(function(resolve){
		setTimeout(resolve, time)
	});
}