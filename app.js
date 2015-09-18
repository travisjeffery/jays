let Xray = require('x-ray');
let x = new Xray();
let uniq = require('underscore').uniq;
let koa = require('koa');
let app = koa();
let handlebars = require('koa-handlebars');
let path = require('path');
let staticCache = require('koa-static-cache');
let debug = require('debug')('app');
let Promise = require('bluebird');
let parse = Promise.promisify(require('csv-parse'));
let fs = require('fs');
let csv = fs.readFileSync('./schedule.csv', 'utf8');
let schedule = null;

const port = (process.env.PORT || 3000);
const url = 'https://www.reddit.com/r/mlbstreams';

app.use(function*(next){
  if (this.url == '/health')
    return this.status = 200;
  yield next;
});

app.use(function*(next){
  let game = schedule[0];
  let day = new Date(game['START DATE']);

  schedule.forEach(function(g){
    let start = new Date(g['START DATE']);
    if (start < day) {
      game = g;
      day = start;
    }
  });

  this.nextGame = {
    day: game['START DATE'],
    time: game['START TIME ET']
  };

  debug('game: %j', game)

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

  console.dir(this.app.context.schedule);

  debug('got links: %j', links);

  yield this.render("index", {
    links: links,
    isGame: links.length > 0,
    nextGame: this.nextGame
  });
});

debug(`booting app at :${port}`);

parse(csv, { columns: true })
  .then(function(data){
    schedule = data;
    app.listen(port);
  })
  .catch(function(err) {
    throw err;
  });

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
