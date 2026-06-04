import { createOptimizedPicture, toClassName } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Converts a Cards table (or row-based cards block) into cards markup.
 * @param {Element} container Element wrapping the cards content
 */
function decorateCards(container) {
  const table = container.querySelector('table');
  let rows = [];

  if (table) {
    const tableRows = [...table.querySelectorAll('tbody tr')];
    if (tableRows.length < 2 || !/^cards$/i.test(tableRows[0].textContent.trim())) return;
    rows = tableRows.slice(1);
  } else if (container.classList.contains('cards')) {
    rows = [...container.children];
  } else {
    return;
  }

  const ul = document.createElement('ul');
  rows.forEach((row) => {
    const cells = row.tagName === 'TR'
      ? [...row.querySelectorAll('td')]
      : [...row.children];
    if (cells.length < 2) return;

    const li = document.createElement('li');
    moveInstrumentation(row, li);

    const imageDiv = document.createElement('div');
    imageDiv.className = 'cards-card-image';
    while (cells[0].firstChild) imageDiv.append(cells[0].firstChild);

    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'cards-card-body';
    while (cells[1].firstChild) bodyDiv.append(cells[1].firstChild);

    li.append(imageDiv, bodyDiv);
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  const cards = document.createElement('div');
  cards.className = 'cards';
  cards.append(ul);

  if (table) {
    const wrapper = table.parentElement;
    wrapper.replaceWith(cards);
  } else {
    container.replaceChildren(cards);
  }
}

/**
 * Finds and decorates cards content inside a tab panel.
 * @param {Element} panel Tab panel element
 */
function decorateCardsInPanel(panel) {
  panel.querySelectorAll('table').forEach((table) => {
    const header = table.querySelector('tbody tr');
    if (header && /^cards$/i.test(header.textContent.trim())) {
      decorateCards(table.parentElement);
    }
  });

  panel.querySelectorAll(':scope > .cards, :scope > div > .cards').forEach((cards) => {
    if (!cards.querySelector('ul')) decorateCards(cards);
  });
}

export default async function decorate(block) {
  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');

  const tabs = [...block.children].map((child) => child.firstElementChild);
  tabs.forEach((tab, i) => {
    const id = toClassName(tab.textContent);

    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    decorateCardsInPanel(tabpanel);

    const button = document.createElement('button');
    button.className = 'tabs-tab';
    button.id = `tab-${id}`;
    button.innerHTML = tab.innerHTML;
    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });
    tablist.append(button);
    tab.remove();
  });

  block.prepend(tablist);
}
