var Xray = require('x-ray');
var x = new Xray();
var uniq = require('underscore').uniq;
var koa = require('koa');
var app = koa();
var handlebars = require('koa-handlebars');
var port = 3000;

app.use(handlebars({
  defaultLayout: "main",
  cache: false
}));

app.use(function*(){
  var links = yield* getLinks();

  yield this.render("index", {
    links: links,
    isGame: links.length > 0
  });
});

console.log('app listening at :' + port);

app.listen(port);

function *getLinks() {
  var l = yield x('https://www.reddit.com/r/mlbstreams', 'a.title.may-blank@href');
  var arr = yield x(l, ['div.usertext-body a']);
  var youtubes = arr.filter(function(link){
    return !!link.match(/https:\/\/.*yout/);
  });
  youtubes = uniq(youtubes);
  return youtubes;
};
