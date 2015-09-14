let Xray = require('x-ray');
let x = new Xray();
let uniq = require('underscore').uniq;
let koa = require('koa');
let app = koa();
let handlebars = require('koa-handlebars');
let path = require('path');
let staticCache = require('koa-static-cache');

const port = 3000;
const url = 'https://www.reddit.com/r/mlbstreams';

app.use(staticCache(path.join(__dirname, 'public'), {
  maxAge: 365 * 24 * 60 * 60
}));

app.use(handlebars({
  defaultLayout: "main",
  cache: false
}));

app.use(function*(){
  let links = yield* getLinks();

  yield this.render("index", {
    links: links,
    isGame: links.length > 0
  });
});

console.log(`app listening at :${port}`);

app.listen(port);

function *getLinks() {
  let l = yield x(url, 'a.title.may-blank@href');
  let arr = yield x(l, ['div.usertext-body a']);
  let yt = filter(arr);
  yt = uniq(yt);
  return yt;
};

function filter(arr) {
  return arr.filter(function(link){
    return !!link.match(/https:\/\/.*yout/);
  });
};
