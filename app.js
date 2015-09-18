let Xray = require('x-ray');
let x = new Xray();
let uniq = require('underscore').uniq;
let koa = require('koa');
let app = koa();
let handlebars = require('koa-handlebars');
let path = require('path');
let staticCache = require('koa-static-cache');
let debug = require('debug')('app');

const port = (process.env.PORT || 3000);
const url = 'https://www.reddit.com/r/mlbstreams';

app.use(function*(next){
  if (this.url == '/health')
    return this.status = 200;
  yield next;
});

app.use(staticCache(path.join(__dirname, 'public'), {
  maxAge: 365 * 24 * 60 * 60
}));

app.use(handlebars({
  defaultLayout: "main",
  cache: false
}));

app.use(function*(){
  let links = yield getLinks();

  debug('got links: %j', links);

  yield this.render("index", {
    links: links,
    isGame: links.length > 0
  });
});

debug(`booting app at :${port}`);

app.listen(port);

/**
 * Scrape reddit for jays streams.
 *
 * @return {Array}
 */

function *getLinks() {
  let l = yield x(url, 'a.title.may-blank@href');
  let arr = yield x(l, ['div.usertext-body a']);
  let yt = filter(arr);
  yt = uniq(yt);
  return yt;
};

/**
 * Filter out non-youtube streams.
 *
 * @param {Array}
 * @return {Array}
 */

function filter(arr) {
  return arr.filter(function(link){
    return !!link.match(/https:\/\/.*yout/);
  });
};
