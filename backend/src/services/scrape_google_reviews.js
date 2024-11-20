import gplay from 'google-play-scraper';

// Retrieves a list of apps that results of searching by the given term.
gplay.search({
  term: "zomato",
  num: 2
}).then(console.log, console.log);

// Retrieves the full detail of an application.
gplay.app({ appId: 'com.application.zomato' })
  .then(console.log, console.log);

// Given a string returns up to five suggestion to complete a search query term.
gplay.suggest({ term: 'zomato' }).then(console.log);

// Retrieve a full list of categories present from dropdown menu on Google Play.
gplay.categories().then(console.log);