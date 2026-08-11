/* Temporary loader — restores app from last known-good commit */
(function () {
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/gh/MyDomsHurt/breathe-easy-dashboard@552abb571b18c7ca0968e5defd65b9fe5a9fa9a4/app.js';
  s.onload = function () { console.log('app.js restored from good commit'); };
  s.onerror = function () {
    var s2 = document.createElement('script');
    s2.src = 'https://raw.githubusercontent.com/MyDomsHurt/breathe-easy-dashboard/552abb571b18c7ca0968e5defd65b9fe5a9fa9a4/app.js';
    document.head.appendChild(s2);
  };
  document.head.appendChild(s);
})();
