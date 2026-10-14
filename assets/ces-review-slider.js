/*
 * <ces-review-slider> — auto-advancing review slider for the CES Reviews block.
 * The track is a native scroll-snap container, so swipe and trackpad work
 * without JS; this advances it every `data-interval` seconds, wrapping from
 * the last review to the first. Hover, focus or a touch pauses it, and it
 * only runs while the slider is on screen and the tab is visible.
 */
if (!customElements.get('ces-review-slider')) {
  customElements.define(
    'ces-review-slider',
    class CesReviewSlider extends HTMLElement {
      connectedCallback() {
        this.track = this.querySelector('[data-track]');
        this.slides = Array.from(this.querySelectorAll('[data-slide]'));
        if (!this.track || this.slides.length < 2) return;

        this.delay = Math.max(2, Number(this.dataset.interval) || 5) * 1000;
        this.paused = false;
        this.visible = false;
        this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const pause = () => { this.paused = true; this.stop(); };
        const resume = () => { this.paused = false; this.start(); };
        this.addEventListener('mouseenter', pause);
        this.addEventListener('mouseleave', resume);
        this.addEventListener('focusin', pause);
        this.addEventListener('focusout', resume);
        this.track.addEventListener('touchstart', pause, { passive: true });
        this.track.addEventListener('touchend', resume, { passive: true });

        this.onVisibility = () => (document.hidden ? this.stop() : this.start());
        document.addEventListener('visibilitychange', this.onVisibility);

        this.observer = new IntersectionObserver((entries) => {
          this.visible = entries.some((e) => e.isIntersecting);
          this.visible ? this.start() : this.stop();
        });
        this.observer.observe(this);
      }

      disconnectedCallback() {
        this.stop();
        this.observer?.disconnect();
        if (this.onVisibility) document.removeEventListener('visibilitychange', this.onVisibility);
      }

      start() {
        this.stop();
        if (this.paused || !this.visible || document.hidden) return;
        this.timer = setInterval(() => this.go(this.index() + 1), this.delay);
      }

      stop() {
        clearInterval(this.timer);
        this.timer = null;
      }

      // Distance from one slide to the next, gap included.
      step() {
        return this.slides[1].offsetLeft - this.slides[0].offsetLeft || this.track.clientWidth || 1;
      }

      index() {
        return Math.round(this.track.scrollLeft / this.step());
      }

      go(i) {
        const next = (i + this.slides.length) % this.slides.length;
        this.track.scrollTo({ left: next * this.step(), behavior: this.reduceMotion ? 'auto' : 'smooth' });
      }
    }
  );
}
