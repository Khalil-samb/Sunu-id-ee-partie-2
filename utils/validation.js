
export function validerTitre(input) {
  const value = input.value.trim();
  if (value.length < 5) {
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");
    return false;
  }
  input.classList.remove("is-invalid");
  input.classList.add("is-valid");
  return true;
}

export function validerDescription(input, invalidFeedbackEl) {
  const value = input.value.trim();
  if (value.length < 20) {
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");
    if (invalidFeedbackEl) invalidFeedbackEl.style.display = "block";
    return false;
  }
  input.classList.remove("is-invalid");
  input.classList.add("is-valid");
  if (invalidFeedbackEl) invalidFeedbackEl.style.display = "none";
  return true;
}

