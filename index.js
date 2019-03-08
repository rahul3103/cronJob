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

const insertIntoLink = async (_id, newLink) =>
  await Links.findByIdAndUpdate(_id, newLink, {
    upsert: true,
    setDefaultsOnInsert: true
  });

const eveningStandard = () => {};

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

  requiredDivs.each(async (i, elem) => {
    const anchor = $(elem).find('a.hll');
    const href = anchor.attr('href');
    const _id = /A\/(.*?)\?/g.exec(href)[1];
    const publisher = $(elem)
      .find('span.src')
      .data('pub');

    insertIntoLink(_id, {
      published_on: $(elem)
        .find('span.time')
        .data('time'),
      href,
      title: anchor.text(),
      publisher,
      team_id: 1
    }).catch(e => console.error(e));

    console.info(
      `Inserting into DB: ${_id}. ${$(elem)
        .find('span.src')
        .data('pub')}`
    );
  });
  // $('h1.headline').text().trim()
  // $('div.body-content > p').map((i, elem) => $(elem).text()).get().join('</p><p>')
  await browser.close();
};

mongoose
  .connect(process.env.DB_URI, { useNewUrlParser: true })
  .then(() => scrapper())
  .then(() => process.exit())
  .catch(err => console.log(err));
