(function(){
  var host = window.location.hostname;
  if (!/\.vercel\.app$|\.dcrader\.dev$|^localhost$|^127\.0\.0\.1$/.test(host)) return;

  var industries = [
    ['Restaurants',   'https://dcrader-template-restaurants.vercel.app'],
    ['Pet services',  'https://dcrader-template-pets.vercel.app'],
    ['Trades',        'https://dcrader-template-trades.vercel.app'],
    ['Dental',        'https://dcrader-template-dentists.vercel.app'],
    ['Chiropractors', 'https://dcrader-template-chiropractors.vercel.app'],
    ['Photographers', 'https://dcrader-template-photographers.vercel.app'],
    ['Auto',          'https://dcrader-template-auto.vercel.app'],
    ['Salons',        'https://dcrader-template-salons.vercel.app'],
    ['Landscape',     'https://dcrader-template-landscape.vercel.app'],
    ['Real estate',   'https://dcrader-template-realestate.vercel.app'],
    ['Tattoo',        'https://dcrader-template-tattoo.vercel.app'],
    ['Trainers',      'https://dcrader-template-trainers.vercel.app']
  ];

  var socialGambling = [
    ['Social Stakes',  'https://socialstakes-frontend.vercel.app'],
    ['ChipShot Poker', 'https://chipshot-poker.vercel.app'],
    ['OddsRoom',       'https://oddsroom.vercel.app'],
    ['ParlayLab',      'https://parlaylab.vercel.app']
  ];

  var publishing = [
    ['Shmedium',     'https://shmedium-frontend.vercel.app'],
    ['Boil & Bake',  'https://dcrader-publishing-boilbake.vercel.app'],
    ['Frame Notes',  'https://dcrader-publishing-framenotes.vercel.app'],
    ['Field Letter', 'https://dcrader-publishing-fieldletter.vercel.app']
  ];

  var fitness = [
    ['ProFuelPrep',     'https://profuelprep.com'],
    ['Macros + Miles',  'https://dcrader-fitness-macrosmiles.vercel.app'],
    ['Stack',           'https://dcrader-fitness-stack.vercel.app'],
    ['Plate Notes',     'https://dcrader-fitness-platenotes.vercel.app']
  ];

  function mount(){
    if (document.getElementById('dcrader-th')) return;
    var css = ''
      + '#dcrader-th{position:fixed;top:0;left:0;right:0;z-index:2147483600;'
      + 'background:rgba(20,20,22,0.92);backdrop-filter:saturate(140%) blur(8px);-webkit-backdrop-filter:saturate(140%) blur(8px);'
      + 'color:#e8e8ea;font:500 12px/1 system-ui,-apple-system,Segoe UI,sans-serif;'
      + 'border-bottom:1px solid rgba(255,255,255,0.08);transform:translateY(0);will-change:transform;}'
      + '#dcrader-th.dt-hidden{transform:translateY(-100%);transition:transform .18s ease-out;}'
      + '#dcrader-th.dt-shown{transition:transform .18s ease-out;}'
      + '#dcrader-th .dt-inner{max-width:1200px;margin:0 auto;padding:0 14px;height:34px;display:flex;align-items:center;justify-content:space-between;gap:16px;}'
      + '#dcrader-th a{color:#e8e8ea;text-decoration:none;}'
      + '#dcrader-th .dt-home{font-weight:600;letter-spacing:0.01em;opacity:.95;}'
      + '#dcrader-th .dt-home:hover{opacity:1;}'
      + '#dcrader-th nav{display:flex;align-items:center;gap:14px;}'
      + '#dcrader-th nav a{opacity:.78;}'
      + '#dcrader-th nav a:hover{opacity:1;}'
      + '#dcrader-th .dt-dd{position:relative;}'
      + '#dcrader-th .dt-dd button{background:transparent;border:0;color:#e8e8ea;font:inherit;cursor:pointer;padding:6px 8px;opacity:.85;}'
      + '#dcrader-th .dt-dd button:hover,#dcrader-th .dt-dd button[aria-expanded="true"]{opacity:1;}'
      + '#dcrader-th .dt-menu{position:absolute;top:calc(100% + 4px);right:0;min-width:250px;max-height:min(78vh,640px);overflow:auto;background:#18181b;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:6px 0;box-shadow:0 12px 32px rgba(0,0,0,0.4);}'
      + '#dcrader-th .dt-menu[hidden]{display:none;}'
      + '#dcrader-th .dt-menu .dt-sec{padding:10px 14px 4px;font-size:10px;letter-spacing:0.08em;color:#8a8a90;text-transform:uppercase;}'
      + '#dcrader-th .dt-menu .dt-sec:first-child{padding-top:8px;}'
      + '#dcrader-th .dt-menu a{display:block;padding:7px 14px;font-size:12.5px;color:#e8e8ea;opacity:.85;}'
      + '#dcrader-th .dt-menu a:hover{background:rgba(255,255,255,0.06);opacity:1;}'
      + '#dcrader-th .dt-menu .dt-back{border-top:1px solid rgba(255,255,255,0.08);margin-top:6px;padding-top:6px;}'
      + 'html{--dt-th-h:34px;}'
      + 'html.dt-th-hidden{--dt-th-h:0px;}'
      + 'html.dt-th-mounted{scroll-padding-top:var(--dt-th-h);}'
      + 'html.dt-th-mounted [data-dt-shifted]{top:var(--dt-th-h)!important;transition:top .18s ease-out;}'
      + 'html.dt-th-mounted body[data-dt-body-shifted]{padding-top:var(--dt-th-h)!important;transition:padding-top .18s ease-out;}'
      + '@media (max-width:520px){html{--dt-th-h:32px;}#dcrader-th .dt-inner{height:32px;padding:0 10px;gap:8px;}#dcrader-th nav{gap:10px;}#dcrader-th nav a:not(.dt-pri){display:none;}#dcrader-th .dt-menu{max-height:70vh;}}'
      ;
    var style = document.createElement('style');
    style.id = 'dcrader-th-style';
    style.textContent = css;
    document.head.appendChild(style);

    var bar = document.createElement('div');
    bar.id = 'dcrader-th';
    bar.setAttribute('role','navigation');
    bar.setAttribute('aria-label','dcrader portfolio');

    function section(title, items){
      return '<div class="dt-sec">'+title+'</div>'
        + items.map(function(p){ return '<a href="'+p[1]+'">'+p[0]+'</a>'; }).join('');
    }

    bar.innerHTML = ''
      + '<div class="dt-inner">'
      + '  <a class="dt-home" href="https://dcrader.dev">&larr; dcrader.dev</a>'
      + '  <nav>'
      + '    <a href="https://dcrader.dev/pricing">Pricing</a>'
      + '    <a href="https://dcrader.dev/contact">Contact</a>'
      + '    <div class="dt-dd">'
      + '      <button type="button" aria-expanded="false" aria-haspopup="true">Browse portfolio &#9662;</button>'
      + '      <div class="dt-menu" hidden>'
      +          section('Industry templates', industries)
      +          section('Social &amp; gambling', socialGambling)
      +          section('Publishing', publishing)
      +          section('Fitness &amp; nutrition', fitness)
      + '        <div class="dt-back"><a href="https://dcrader.dev">&larr; Back to dcrader.dev</a></div>'
      + '      </div>'
      + '    </div>'
      + '  </nav>'
      + '</div>';
    document.body.insertBefore(bar, document.body.firstChild);
    document.documentElement.classList.add('dt-th-mounted');

    // Keep --dt-th-h in sync with the bar's true rendered height (incl. border)
    // so body padding/scroll-padding don't leave a 1px gap.
    function syncBarHeight(){
      var h = bar.offsetHeight;
      if (h) document.documentElement.style.setProperty('--dt-th-h', h + 'px');
    }
    syncBarHeight();
    window.addEventListener('resize', syncBarHeight);

    function shiftHostNavs(){
      var els = document.body.querySelectorAll('*');
      var vw = window.innerWidth;
      var shiftedAny = false;
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        if (el === bar || bar.contains(el)) continue;
        if (el.hasAttribute('data-dt-shifted')) continue;
        var cs = getComputedStyle(el);
        if ((cs.position !== 'fixed' && cs.position !== 'sticky') || parseFloat(cs.top) > 8) continue;
        var r = el.getBoundingClientRect();
        // Only target wide elements: top navs, full-screen drawers/overlays.
        // Skips small floating UI like custom cursors, back-to-top pills, chat widgets.
        if (r.width < vw * 0.4) continue;
        el.setAttribute('data-dt-shifted','');
        shiftedAny = true;
      }
      // Fallback: if no fixed/sticky header was shifted, push the whole body
      // down so the page's static/in-flow header isn't clipped by our bar.
      if (!document.body.hasAttribute('data-dt-body-shifted')) {
        var hasShifted = shiftedAny || document.querySelector('[data-dt-shifted]');
        if (!hasShifted) {
          document.body.setAttribute('data-dt-body-shifted','');
        }
      }
    }
    shiftHostNavs();
    window.addEventListener('resize', shiftHostNavs);
    // Re-sweep after late hydration (React/SPA) renders headers post-load.
    try {
      var mo = new MutationObserver(function(){ shiftHostNavs(); });
      mo.observe(document.body, { childList: true, subtree: true });
      setTimeout(function(){ try { mo.disconnect(); } catch(_){} }, 4000);
    } catch(_) {}
    setTimeout(shiftHostNavs, 250);
    setTimeout(shiftHostNavs, 1000);

    var btn = bar.querySelector('.dt-dd button');
    var menu = bar.querySelector('.dt-menu');
    function close(){ btn.setAttribute('aria-expanded','false'); menu.hidden = true; }
    function open(){ btn.setAttribute('aria-expanded','true'); menu.hidden = false; }
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      if (menu.hidden) open(); else close();
    });
    document.addEventListener('click', function(e){
      if (!bar.contains(e.target)) close();
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape') close();
    });

    var lastY = window.scrollY;
    var ticking = false;
    function onScroll(){
      var y = window.scrollY;
      if (Math.abs(y - lastY) < 6) { ticking = false; return; }
      if (y > lastY && y > 60) {
        bar.classList.add('dt-shown');
        bar.classList.add('dt-hidden');
        document.documentElement.classList.add('dt-th-hidden');
      } else {
        bar.classList.add('dt-shown');
        bar.classList.remove('dt-hidden');
        document.documentElement.classList.remove('dt-th-hidden');
      }
      lastY = y;
      ticking = false;
    }
    window.addEventListener('scroll', function(){
      if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
