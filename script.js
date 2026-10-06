/* ==================================================================
   PORTFOLIO SCRIPT: Jason Siddharta Salim

   WHAT THIS FILE DOES
     1. Fills in the current year in the footer.
     2. Opens and closes the mobile "Menu" button.
     3. Underlines the nav link for the section you are viewing.
     4. Plays the image reveal when a gallery scrolls into view.

   The page still works if this file fails to load. You just lose
   the menu button on phones and the scroll animations.
   ================================================================== */

(() => {
  'use strict';

  /* ----------------------------------------------------------------
     SETTINGS: the numbers you are most likely to want to change.
     ---------------------------------------------------------------- */
  const SETTINGS = {
    // How much of a gallery must be on screen before its reveal plays.
    // 0 = as soon as one pixel shows, 1 = only when fully visible.
    revealThreshold: 0.2,

    // true  = each gallery animates once, then stays visible.
    // false = it animates every time you scroll back to it.
    revealOnce: true,

    // Which part of the screen counts as "the section I'm looking at"
    // for the nav underline. This band is the middle 5% of the screen.
    // Widen it (e.g. '-30% 0px -60% 0px') to switch sooner.
    navSpyMargin: '-45% 0px -50% 0px',
  };

  // Dynamically check user's system preference for reduced motion
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ----------------------------------------------------------------
     1. FOOTER YEAR
     Any element with data-year gets the current year, so you never
     have to update the copyright line by hand.
     ---------------------------------------------------------------- */
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });


  /* ----------------------------------------------------------------
     2. MOBILE MENU
     On narrow screens the nav links are hidden behind a "Menu"
     button. Clicking toggles the "nav--open" class, which style.css
     uses to show the links. The menu also closes when you pick a
     link or press Escape.
     ---------------------------------------------------------------- */
  const nav = document.getElementById('nav');
  const toggle = document.querySelector('.nav__toggle');

  if (nav && toggle) {
    const setOpen = (open) => {
      nav.classList.toggle('nav--open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';   // EDIT: button labels
    };

    toggle.addEventListener('click', () => {
      setOpen(!nav.classList.contains('nav--open'));
    });

    nav.querySelectorAll('.nav__links a').forEach((link) => {
      link.addEventListener('click', () => setOpen(false));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setOpen(false);
    });
  }


  /* ----------------------------------------------------------------
     3. NAV HIGHLIGHT (scroll spy)
     Watches each section that a nav link points to. When one crosses
     the middle of the screen, its link gets aria-current="true",
     which style.css draws as an underline.

     To add a section to this, give it an id and add a nav link
     with a matching href. No change is needed here.
     ---------------------------------------------------------------- */
  const navLinks = Array.from(document.querySelectorAll('.nav__links a[href^="#"]'));

  if (navLinks.length && 'IntersectionObserver' in window) {
    const targets = navLinks
      .map((link) => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = '#' + entry.target.id;
        navLinks.forEach((link) => {
          if (link.getAttribute('href') === id) {
            link.setAttribute('aria-current', 'true');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      });
    }, { rootMargin: SETTINGS.navSpyMargin });

    targets.forEach((section) => spy.observe(section));
  }

    /* ----------------------------------------------------------------
     5. MUSIC PLAYER
     Builds the player from the .tracklist links in index.html.
     To add a track, add an <li class="track"> there. No change is
     needed here. Without JS the links still open the audio files.
     ---------------------------------------------------------------- */
  const player = document.getElementById('player');
  const trackLinks = Array.from(document.querySelectorAll('.tracklist a'));

  if (player && trackLinks.length) {
    const audio     = player.querySelector('.player__audio');
    const titleEl   = player.querySelector('.player__title');
    const metaEl    = player.querySelector('.player__meta');
    const coverImg  = player.querySelector('.player__cover img');
    const coverNum  = player.querySelector('.player__cover-num');
    const seek      = player.querySelector('.player__seek');
    const vol       = player.querySelector('.player__vol');
    const curEl     = player.querySelector('.player__current');
    const durEl     = player.querySelector('.player__duration');
    const playBtn   = player.querySelector('.player__play');
    const prevBtn   = player.querySelector('.player__prev');
    const nextBtn   = player.querySelector('.player__next');

    let current = 0;

    const fmt = (s) => {
      if (!isFinite(s)) return '0:00';
      const m = Math.floor(s / 60);
      const sec = String(Math.floor(s % 60)).padStart(2, '0');
      return `${m}:${sec}`;
    };

    const setFill = (input) => {
      const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
      input.style.setProperty('--pct', pct + '%');
    };

    const setPlaying = (playing) => {
      player.classList.toggle('is-playing', playing);
      playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    };

    const load = (index, autoplay) => {
      current = (index + trackLinks.length) % trackLinks.length;
      const link = trackLinks[current];

      audio.src = link.getAttribute('href');
      titleEl.textContent = link.querySelector('.track__title').textContent;
      metaEl.textContent  = link.querySelector('.track__meta').textContent;
      coverNum.textContent = String(current + 1).padStart(2, '0');

      const cover = link.dataset.cover;
      if (cover) {
        coverImg.src = cover;
        coverImg.hidden = false;
        coverNum.hidden = true;
      } else {
        coverImg.hidden = true;
        coverNum.hidden = false;
      }

      trackLinks.forEach((l, i) => {
        if (i === current) l.setAttribute('aria-current', 'true');
        else l.removeAttribute('aria-current');
      });

      seek.value = 0;
      setFill(seek);
      curEl.textContent = '0:00';
      durEl.textContent = '0:00';

      if (autoplay) audio.play().catch(() => setPlaying(false));
    };

    // Buttons
    playBtn.addEventListener('click', () => {
      if (audio.paused) audio.play().catch(() => {});
      else audio.pause();
    });
    prevBtn.addEventListener('click', () => {
      // Restart the track if you're more than 3s in, like most players
      if (audio.currentTime > 3) audio.currentTime = 0;
      else load(current - 1, !audio.paused);
    });
    nextBtn.addEventListener('click', () => load(current + 1, !audio.paused));

    // Tracklist
    trackLinks.forEach((link, i) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        if (i === current) playBtn.click();
        else load(i, true);
      });
    });

    // Audio events
    audio.addEventListener('play',  () => setPlaying(true));
    audio.addEventListener('pause', () => setPlaying(false));
    audio.addEventListener('loadedmetadata', () => { durEl.textContent = fmt(audio.duration); });
    audio.addEventListener('timeupdate', () => {
      if (!audio.duration) return;
      seek.value = (audio.currentTime / audio.duration) * 100;
      setFill(seek);
      curEl.textContent = fmt(audio.currentTime);
    });
    audio.addEventListener('ended', () => {
      if (current < trackLinks.length - 1) load(current + 1, true);   // EDIT: to loop the playlist, remove this condition
      else setPlaying(false);
    });

    // Sliders
    seek.addEventListener('input', () => {
      if (audio.duration) audio.currentTime = (seek.value / 100) * audio.duration;
      setFill(seek);
    });
    vol.addEventListener('input', () => {
      audio.volume = Number(vol.value);
      setFill(vol);
    });

    // Start
    audio.volume = Number(vol.value);
    setFill(vol);
    load(0, false);
  }


  /* ----------------------------------------------------------------
     4. GALLERY REVEAL
     Every .gallery starts with its images hidden (see "Image reveal"
     in style.css). When a gallery scrolls into view we add the class
     "is-visible" and the CSS plays the animation.

     Each image also gets a number (--i = 0, 1, 2 ...) so they can
     appear one after another. The gap between them is
     --reveal-stagger in style.css.

     To animate something else the same way, give it the class
     "gallery" (or copy this pattern for a new class).
     ---------------------------------------------------------------- */
  const galleries = document.querySelectorAll('.gallery');

  galleries.forEach((gallery) => {
    gallery.querySelectorAll('.ph').forEach((item, index) => {
      item.style.setProperty('--i', index);
    });
  });

  if (!('IntersectionObserver' in window) || reduceMotion) {
    // Old browser, or the visitor asked for no motion: show everything now.
    galleries.forEach((gallery) => gallery.classList.add('is-visible'));
  } else {
    const reveal = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          if (SETTINGS.revealOnce) observer.unobserve(entry.target);
        } else if (!SETTINGS.revealOnce) {
          entry.target.classList.remove('is-visible');
        }
      });
    }, { threshold: SETTINGS.revealThreshold });

    galleries.forEach((gallery) => reveal.observe(gallery));
  }

})();