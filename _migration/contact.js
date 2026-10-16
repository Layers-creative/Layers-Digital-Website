// Preserve original Webflow form styling and success/error panels.
(() => {
  document.querySelectorAll('.w-form form').forEach(form => {
    form.action='/api/contact'; form.method='post';
    form.removeAttribute('data-turnstile-sitekey');
    const trap = document.createElement('input');
    trap.name = 'website'; trap.type = 'text'; trap.tabIndex = -1;
    trap.autocomplete = 'off'; trap.setAttribute('aria-hidden', 'true');
    trap.style.cssText = 'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden';
    form.appendChild(trap);
  });
  document.addEventListener('submit', async event => {
    const form = event.target;
    if (!form.matches('form[action="/api/contact"]')) return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (form.dataset.sending || !form.reportValidity()) return;
    const wrapper=form.closest('.w-form'), success=wrapper?.querySelector('.w-form-done'), failure=wrapper?.querySelector('.w-form-fail');
    const button=form.querySelector('[type=submit]'), original=button?.value;
    const fields=[...form.querySelectorAll('input,textarea')];
    const field = pattern => fields.find(el => pattern.test(el.name))?.value || '';
    form.dataset.sending='true';
    if(button){button.disabled=true;button.value=button.dataset.wait || 'Please wait...';}
    if(failure)failure.style.display='none';
    try {
      const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:field(/^name/i),email:field(/^email/i),message:field(/^message/i),website:form.elements.website.value})});
      const result=await response.json();
      if(!response.ok || !result.ok)throw Error('Delivery failed');
      form.style.display='none';
      if(success){success.style.display='block';success.tabIndex=-1;success.focus();}
    } catch {
      if(failure){failure.style.display='block';failure.tabIndex=-1;failure.focus();}
    } finally {
      delete form.dataset.sending;
      if(button){button.disabled=false;button.value=original;}
    }
  },true);
})();
