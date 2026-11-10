const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');
if (toggle && nav) {
  const close = () => { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); toggle.textContent = 'Menu +'; };
  toggle.addEventListener('click', () => { const open = !nav.classList.contains('is-open'); nav.classList.toggle('is-open', open); toggle.setAttribute('aria-expanded', String(open)); toggle.textContent = open ? 'Close −' : 'Menu +'; });
  nav.addEventListener('click', event => { if (event.target.closest('a')) close(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('is-open')) { close(); toggle.focus(); } });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) close(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 760) close(); });
}

function refreshEmptyContent() {
  document.querySelectorAll('[data-edit-key]').forEach(field => {
    field.classList.toggle('is-empty-content', !field.textContent.trim());
  });
  document.querySelectorAll('.experience-list article,.experience-list,.hero-meta>div').forEach(group => {
    group.classList.toggle('is-empty-group', !group.textContent.trim() && !group.querySelector('img,svg'));
  });
}
refreshEmptyContent();
document.addEventListener('input', refreshEmptyContent);
document.addEventListener('portfolio:text-state', refreshEmptyContent);

let activeProject = null;
let projectTrigger = null;
function notifyProject(dialog) {
  document.dispatchEvent(new CustomEvent('portfolio:project-change', {detail:{dialog}}));
}
function hideProject(restoreFocus = false) {
  if (!activeProject) return;
  const previous = activeProject;
  activeProject = null;
  notifyProject(null);
  previous.close();
  document.body.classList.remove('has-open-project');
  if (restoreFocus && projectTrigger) projectTrigger.focus({preventScroll:true});
}
function syncProjectHash() {
  let id;
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  const target = document.getElementById(id);
  const dialog = target?.closest('.project-dialog');
  if (!dialog) { hideProject(true); return; }
  if (activeProject !== dialog) {
    hideProject();
    activeProject = dialog;
    dialog.showModal();
    document.body.classList.add('has-open-project');
    notifyProject(dialog);
    dialog.scrollTop = 0;
  }
  if (target !== dialog) requestAnimationFrame(() => target.scrollIntoView({block:'start'}));
}
function closeProject() {
  history.pushState(null, '', '#projects');
  hideProject(true);
}
document.addEventListener('click', event => {
  if (event.defaultPrevented) return;
  if (event.target.closest('[data-close-project]')) { closeProject(); return; }
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  const id = link.getAttribute('href').slice(1);
  const target = document.getElementById(id);
  const dialog = target?.closest('.project-dialog');
  if (dialog) {
    event.preventDefault();
    if (!activeProject) projectTrigger = link;
    history.pushState(null, '', '#'+id);
    syncProjectHash();
  } else if (activeProject) {
    event.preventDefault();
    history.pushState(null, '', '#'+id);
    hideProject(true);
    target?.scrollIntoView({block:'start'});
  }
});
document.querySelectorAll('.project-dialog').forEach(dialog => {
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeProject(); });
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) closeProject();
  });
});
window.addEventListener('hashchange', syncProjectHash);
window.addEventListener('popstate', syncProjectHash);
syncProjectHash();
