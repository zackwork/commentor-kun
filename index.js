const puppeteer = require("puppeteer-extra")
const cheerio = require('cheerio')
const fs = require("fs/promises")
const fsr = require("fs")
const StealthPlugin = require("puppeteer-extra-plugin-stealth")
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker")
puppeteer.use(StealthPlugin())
puppeteer.use(AdblockerPlugin())

start();

async function start(){

	let linksToVisit = [];
	let rawdata = fsr.readFileSync('visitedlinks.json');
	let visitedLinks = JSON.parse(rawdata);


	


	const browser = await puppeteer.launch({ 
		headless: true,
		userDataDir: "user_data",
		args: ["--no-sandbox"] 
	});

	const page = await browser.newPage();
	await page.setViewport({ width: 1366, height: 657 });
	await page.goto("https://kunmanga.com/", {
		waitUntil: 'networkidle2'
	})

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
		await delay(5000);
		await page.type(".input.user_login", "emeral");
		await page.type(".input.user_pass", "12345678tv");
		await page.click("#rememberme");
		await delay(1000);
		await page.click("#loginform .wp-submit");
		await delay(5000);
	}


	while(linksToVisit.length > 0){
		const currentUrl = linksToVisit.pop();
		if(visitedLinks.includes(currentUrl)) continue;

		await page.goto(currentUrl, {
			waitUntil: 'networkidle2'
		});




		const textArr = [
		"Text\r\n1", 
		"Text\r\n2", 
		"Text\r\n3", 
		"Text\r\n4", 
		"Text\r\n5", 
		"Text\r\n6"
		];


		const randomNumber = Math.floor(Math.random()*textArr.length);

		await page.$eval('#comment', el => el.scrollIntoView());
		await page.type('#comment', textArr[randomNumber]);
		// await page.click("#submit");
		await delay(8000);


		visitedLinks.push(currentUrl);


	}

	await page.screenshot({ path: "kunmanga.png" })


	const jsonManga = JSON.stringify(visitedLinks, null, 4);
	await fs.writeFile("visitedlinks.json", jsonManga);
	await browser.close();

}






function delay(time){
	return new Promise(function(resolve){
		setTimeout(resolve, time)
	});
}