const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const Links = require('./models/links');
require('dotenv').config();

const publishers = [
  'EVENINGSTANDARD',
  'DAILYMAIL',
  'NWSUN',
  'FOOTBALLLONDON',
  'TOTHOTFC',
  'BBC',
  'SOUTHAMPTONFC'
];

const url =
  'https://www.newsnow.co.uk/h/Sport/Football/Premier+League/Tottenham+Hotspur';

const insertIntoDB = async newLink => await Links.create(newLink);

const scrapper = async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.goto(url);
  const content = await page.content();
  const $ = cheerio.load(content, { normalizeWhitespace: true });
  const divs = $(
    'div.newsmain_wrap.central_ln_wrap.h-spacing--top div.hl__inner'
  );

  const requiredDivs = divs.filter((i, elem) => {
    const publisher = $(elem)
      .find('span.src')
      .data('pub');
    return publishers.includes(publisher);
  });

  requiredDivs.each((i, elem) => {
    const anchor = $(elem).find('a.hll');
    const href = anchor.attr('href');
    const _id = /A\/(.*?)\?/g.exec(href)[1];

    insertIntoDB({
      published_on: $(elem)
        .find('span.time')
        .data('time'),
      href,
      title: anchor.text(),
      publisher: $(elem)
        .find('span.src')
        .data('pub'),
      team_id: 1,
      _id: /A\/(.*?)\?/g.exec(href)[1]
    });

    console.info(
      `Inserting into DB: ${_id}. ${$(elem)
        .find('span.src')
        .data('pub')}`
    );
  });
  await browser.close();
  process.exit();
};

mongoose
  .connect(process.env.DB_URI, { useNewUrlParser: true })
  .then(() => scrapper())
  .catch(err => console.log(err));
