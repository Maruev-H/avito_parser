import axios from 'axios';
import { JSDOM } from 'jsdom';
import { compareCollection, pause } from './helpers/utils';
import p from './helpers/puppeteer';
import db, { Ad, Collection } from './helpers/database';
import fs from 'fs';

(async () => {
  await pause(500);

  let html;

  try {
    console.log('getting page info');
    const { content } = await p.getPageContent(
      'https://www.avito.ru/chechenskaya_respublika/avtomobili/vaz_lada/priora-ASgBAgICAkTgtg3GmSjitg2qrSg',
    );
    html = content;
    console.log('getting page info succeded');
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.log(err);
    }
    console.error(err);
  }

  fs.writeFileSync('cap.html', html);

  const dom = new JSDOM(html);
  const document = dom.window.document;
  const items = document.querySelectorAll('[data-marker=item]');

  const newAds: Collection<Ad> = {};
  console.log(`получено ${items.length} объявлений`);

  items.forEach((node) => {
    newAds[node.id] = {
      id: node.id,
      url: node.querySelector('[itemprop=url]').getAttribute('href'),
      title: node.querySelector('[itemprop=name]').textContent,
      price: Number(
        node.querySelector('[itemprop=price]').getAttribute('content'),
      ),
    };
  });

  console.log(newAds);

  const savedAds = await db.getSavedAds()

  const newIds = compareCollection(savedAds, newAds)

  console.log(newIds)

  for(const id of newIds) {
    await db.setNewAd(newAds[id])
    await pause(500)
  }

  process.exit(1)

})();
