import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Loads and decorates the top CTA banner from a fragment.
 * @param {Element} block The ctabanner block element
 */
export default async function decorate(block) {
  const ctaMeta = getMetadata('cta');
  const ctaPath = ctaMeta ? new URL(ctaMeta, window.location).pathname : '/ctabanner';
  const fragment = await loadFragment(ctaPath);
  if (!fragment) return;

  block.textContent = '';
  const section = fragment.querySelector('.section');
  if (section) {
    [...section.children].forEach((child) => block.append(child));
  }
}
