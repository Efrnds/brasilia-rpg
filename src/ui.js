export function element(tag, text = "", className = "") {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}
export function addOverlay(id, title) {
  const section = element("section", "", "overlay modal-screen hidden");
  section.id = id;
  section.setAttribute("role", "dialog");
  section.setAttribute("aria-modal", "true");
  section.setAttribute("aria-labelledby", `${id}-title`);
  const paper = element("div", "", "paper journal-paper");
  const heading = element("h2", title);
  heading.id = `${id}-title`;
  paper.append(heading);
  section.append(paper);
  document.body.append(section);
  return paper;
}
export function button(text, action, className = "secondary") {
  const node = element("button", text, className);
  node.addEventListener("click", action);
  return node;
}
export function labeledSelect(label, options, value, onchange) {
  const node = element("label", label),
    select = element("select");
  for (const [id, text] of options) {
    const option = element("option", text);
    option.value = id;
    select.append(option);
  }
  select.value = String(value);
  select.addEventListener("change", () => onchange(select.value));
  node.append(select);
  return node;
}
export function renderHistory(parent, history) {
  parent.replaceChildren();
  for (const entry of history.slice(-15)) parent.append(element("p", entry));
}
export function updateControls(bindings) {
  for (const node of document.querySelectorAll("[data-action-key]"))
    node.textContent = bindings
      .code(node.dataset.actionKey)
      .replace("Key", "")
      .replace("Space", "Espaço")
      .replace("ShiftLeft", "Shift");
}
