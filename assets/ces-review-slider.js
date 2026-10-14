/*
 * <ces-review-slider> — horizontal review slider for the CES Reviews block.
 * The track is a native scroll-snap container, so swipe and trackpad work
 * without JS; this only wires the arrows and dots and keeps the active dot
 * in step with whatever the shopper scrolled to.
 */
if (!customElements.get('ces-review-slider')) {
  customElements.define(
    'ces-review-slider',
    class CesReviewSlider extends HTMLElement {
      connectedCallback() {
        this.track = this.querySelector('[data-track]');
        this.slides = Array.from(this.querySelectorAll('[data-slide]'));
        this.dots = Array.from(this.querySelectorAll('[data-dot]'));
        if (!this.track || this.slides.length < 2) return;

        this.querySelector('[data-prev]')?.addEventListener('click', () => this.go(this.index() - 1));
        this.querySelector('[data-next]')?.addEventListener('click', () => this.go(this.index() + 1));
        this.dots.forEach((dot) => dot.addEventListener('click', () => this.go(Number(dot.dataset.dot))));

        let frame;
        this.track.addEventListener(
          'scroll',
          () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => this.sync());
          },
          { passive: true }
        );
      }

      // Distance from one slide to the next, gap included.
      step() {
        return this.slides[1].offsetLeft - this.slides[0].offsetLeft || this.track.clientWidth || 1;
      }

      index() {
        return Math.round(this.track.scrollLeft / this.step());
      }

      go(i) {
        const count = this.slides.length;
        const next = (i + count) % count; // wrap around at either end
        this.track.scrollTo({ left: next * this.step(), behavior: 'smooth' });
      }

      sync() {
        const current = this.index();
        this.dots.forEach((dot, i) => {
          dot.classList.toggle('is-active', i === current);
          dot.setAttribute('aria-current', i === current ? 'true' : 'false');
        });
      }
    }
  );
}
