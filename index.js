const puppeteer = require("puppeteer-extra")
const cheerio = require('cheerio')
const fs = require("fs/promises")
const StealthPlugin = require("puppeteer-extra-plugin-stealth")
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker")
puppeteer.use(StealthPlugin())
puppeteer.use(AdblockerPlugin())

start();

async function start(){

	let linksToVisit = [];
	const visitedLinks = require('./visitedLinks.json');

	

	


	const browser = await puppeteer.launch({ 
		headless: true,
		userDataDir: "user_data",
		args: ["--no-sandbox"] 
	});

	const page = await browser.newPage();
	await page.setViewport({ width: 360, height: 1800 });
	await page.goto("https://kunmanga.com/", {
		waitUntil: 'networkidle2'
	})

	const mangaLinks = await page.evaluate(() => {
		return Array.from(document.querySelectorAll(".post-title a")).map(x => x.href)
	})

	const chapterLinks = await page.evaluate(() => {
		return Array.from(document.querySelectorAll(".chapter .btn-link")).map(x => x.href)
	})

	// linksToVisit = mangaLinks.concat(chapterLinks);
	linksToVisit = mangaLinks;


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

		// await page.$eval('#comment', el => el.scrollIntoView());
		// await page.type('#comment', textArr[randomNumber]);
		// await page.click("#submit");
		await delay(8000);









		// const htmlContent = await page.content()

		// const $ = cheerio.load(htmlContent)

		// const newLinksToVisit = $(".post-title a").map((index, element) => 
		// 	$(element).attr("href")
		// 	).get(); 
		// linksToVisit = [...linksToVisit, ...newLinksToVisit];
		visitedLinks.push(currentUrl);

		// await delay(5000);

	}

	const jsonManga = JSON.stringify(visitedLinks, null, 4);
	await fs.unlink("visitedlinks.json");
	await fs.writeFile("visitedlinks.json", jsonManga);

	await page.screenshot({ path: "kunmanga.png" })
	console.log(visitedLinks);
	console.log("Done");
	await browser.close();

}






function delay(time){
	return new Promise(function(resolve){
		setTimeout(resolve, time)
	});
}