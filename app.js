/* Loader: last complete app lives at commit b0602b70. Do not replace this with a header-only stub. */
(function loadFullApp(){
  var URL = 'https://raw.githubusercontent.com/MyDomsHurt/breathe-easy-dashboard/b0602b70f4a95184136cfd60406ec93525a31a41/app.js';
  fetch(URL, { cache: 'no-store' })
    .then(function(r){
      if(!r.ok) throw new Error('app.js history fetch ' + r.status);
      return r.text();
    })
    .then(function(code){
      if(code.length < 10000) throw new Error('history app.js too small: ' + code.length);
      (0, eval)(code);
    })
    .catch(function(err){
      console.error(err);
      var app = document.getElementById('app');
      if(app) app.innerHTML = '<p>Failed to load dashboard script.</p>';
    });
})();
