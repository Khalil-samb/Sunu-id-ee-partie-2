
export function formaterDate(timestamp) {
  return new Date(timestamp).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function classeCategorie(cat) {
  if (cat === "Pédagogie") return "Pédagogie";
  if (cat === "Événement") return "Événement";
  if (cat === "Vie de campus") return "vie";
  if (cat === "Amélioration technique") return "Amélioration";
  return "";
}

export function afficherToast(message, type = "success") {
  return new Promise((resolve) => {
    const icones = { success: "✅", info: "ℹ️", danger: "❌" };
    const conteneur = document.getElementById("toast-container");

    const toast = document.createElement("div");
    toast.className = "toast-msg " + type;
    toast.innerHTML = `<span>${icones[type] || ""}</span> ${message}`;

    conteneur.appendChild(toast);

    setTimeout(() => {
      toast.remove();
      resolve();
    }, 5000);
  });
}

export function demanderConfirmation() {
  return new Promise((resolve) => {
    const overlay = document.getElementById("confirm-overlay");
    const btnOk = document.getElementById("confirm-ok");
    const btnCancel = document.getElementById("confirm-cancel");

    overlay.classList.add("show");

    function onOk() {
      overlay.classList.remove("show");
      nettoyer();
      resolve(true);
    }

    function onAnnuler() {
      overlay.classList.remove("show");
      nettoyer();
      resolve(false);
    }

    function onBackdrop(e) {
      if (e.target === overlay) onAnnuler();
    }

    function nettoyer() {
      btnOk.removeEventListener("click", onOk);
      btnCancel.removeEventListener("click", onAnnuler);
      overlay.removeEventListener("click", onBackdrop);
    }

    btnOk.addEventListener("click", onOk);
    btnCancel.addEventListener("click", onAnnuler);
    overlay.addEventListener("click", onBackdrop);
  });
}

