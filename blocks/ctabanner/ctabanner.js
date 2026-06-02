import { createOptimizedPicture, getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Structures authored rows into logo + CTA columns.
 * @param {Element} block The ctabanner block element
 */
function structureBlock(block) {
  const inner = document.createElement('div');
  inner.className = 'ctabanner-inner';

  [...block.children].forEach((row) => {
    const cols = [...row.children];
    if (cols.length >= 2) {
      cols[0].classList.add('ctabanner-logo');
      cols[1].classList.add('ctabanner-cta');
      inner.append(cols[0], cols[1]);
    } else {
      inner.append(row);
    }
  });

  block.replaceChildren(inner);

  block.querySelectorAll('.ctabanner-logo picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  const ctaLink = block.querySelector('.ctabanner-cta a');
  if (ctaLink && !ctaLink.classList.contains('button')) {
    ctaLink.classList.add('button', 'secondary');
    const parent = ctaLink.parentElement;
    if (parent && (parent.tagName === 'P' || parent.tagName === 'DIV')) {
      parent.classList.add('button-container');
    }
  }
}

/**
 * Loads and decorates the top CTA banner.
 * Authored as a two-column block: image (left) + secondary button link (right).
 * @param {Element} block The ctabanner block element
 */
export default async function decorate(block) {
  if (!block.children.length) {
    const ctaMeta = getMetadata('cta');
    const ctaPath = ctaMeta ? new URL(ctaMeta, window.location).pathname : '/ctabanner';
    const fragment = await loadFragment(ctaPath);
    const source = fragment?.querySelector('.ctabanner') || fragment?.querySelector('.section > div > div');
    if (source) {
      block.replaceChildren(...source.children);
    }
  }

  if (block.children.length) {
    structureBlock(block);
  }
}
