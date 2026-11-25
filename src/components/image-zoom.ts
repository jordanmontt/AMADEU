/**
 * `<image-zoom>`: opens the link it wraps in PhotoSwipe, a viewer with zoom and pan, also
 * with the fingers on a phone (RF-27). Without JavaScript the link opens the image itself.
 * The viewer is loaded only when first opened.
 */
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';
import { es } from '../i18n/es';

class ImageZoom extends HTMLElement {
  #lightbox: PhotoSwipeLightbox | undefined;

  connectedCallback(): void {
    this.#lightbox = new PhotoSwipeLightbox({
      gallery: this,
      children: 'a',
      pswpModule: () => import('photoswipe'),
      closeTitle: es.gallery.zoom.close,
      zoomTitle: es.gallery.zoom.zoom,
      arrowPrevTitle: es.gallery.zoom.previous,
      arrowNextTitle: es.gallery.zoom.next,
      errorMsg: es.gallery.zoom.error,
      bgOpacity: 0.95,
    });
    this.#lightbox.init();
  }

  disconnectedCallback(): void {
    this.#lightbox?.destroy();
    this.#lightbox = undefined;
  }
}

customElements.define('image-zoom', ImageZoom);
