import {
  fetchIdees,
  insertIdee,
  fetchIdeeById,
  updateIdee,
  deleteIdee
} from "./api/supabase.js";
import { suggererCategorieIA } from "./api/openrouter.js";
import {
  formaterDate,
  classeCategorie,
  afficherToast,
  demanderConfirmation
} from "./utils/ui.js";
import { validerTitre, validerDescription } from "./utils/validation.js";

let idees = [];
let activeFilter = "Tous";
let editingId = null;
let deletingId = null;

function creerCarteIdee(idee) {
  const carte = document.createElement("div");
  carte.className = "idea-card";
  carte.dataset.id = idee.id;
  carte.dataset.cat = idee.categorie;

  carte.innerHTML =
    '<div class="d-flex align-items-center justify-content-between gap-2">' +
    `<span class="cat-badge ${classeCategorie(idee.categorie)}">${idee.categorie}</span>` +
    `<span class="idea-date">${formaterDate(idee.created_at)}</span>` +
    "</div>" +
    `<p class="idea-title">${idee.titre}</p>` +
    `<p class="idea-desc">${idee.description}</p>` +
    '<div class="card-actions mt-auto">' +
    `<button class="btn-edit" data-id="${idee.id}"><i class="bi bi-pencil"></i> Éditer</button>` +
    `<button class="btn-delete" data-id="${idee.id}"><i class="bi bi-trash3"></i> Supprimer</button>` +
    "</div>";

  return carte;
}

async function rechargerIdeesSiNecessaire() {
  if (!idees.length) {
    try {
      idees = await fetchIdees();
    } catch {
      idees = [];
      await afficherToast("Erreur lors du chargement des idées.", "danger");
    }
  }
}

async function afficherMur() {
  await rechargerIdeesSiNecessaire();

  const grille = document.getElementById("ideas-grid");
  const vide = document.getElementById("empty-state");

  document.getElementById("total-count").textContent = idees.length;

  const ideesFiltrees =
    activeFilter === "Tous"
      ? idees
      : idees.filter(
          (idee) =>
            idee.categorie.trim().toLowerCase() ===
            activeFilter.trim().toLowerCase()
        );

  grille.querySelectorAll(".idea-card").forEach((c) => c.remove());

  if (!ideesFiltrees.length) {
    vide.style.display = "block";
    return;
  }

  vide.style.display = "none";
  [...ideesFiltrees].reverse().forEach((idee) => {
    grille.appendChild(creerCarteIdee(idee));
  });
}

async function ajouterIdee() {
  const titreInput = document.getElementById("input-title");
  const catInput = document.getElementById("input-cat");
  const descInput = document.getElementById("input-desc");
  const invalidFeedback = document.querySelector(".invalid-feedback");

  const titreOk = validerTitre(titreInput);
  const descOk = validerDescription(descInput, invalidFeedback);

  if (!titreOk || !descOk) {
    await afficherToast(
      "Veuillez corriger les erreurs du formulaire.",
      "danger"
    );
    return;
  }

  let categorie = catInput.value;

  // Si aucune catégorie choisie, on demande à l’IA avec fallback
  if (!categorie) {
    await afficherToast(
      "✏️ L'IA cherche une catégorie adaptée...",
      "info"
    );
    categorie = await suggererCategorieIA({
      titre: titreInput.value,
      description: descInput.value
    });
    catInput.value = categorie;
  }

  try {
    const ideeCreee = await insertIdee({
      titre: titreInput.value.trim(),
      categorie,
      description: descInput.value.trim()
    });

    if (ideeCreee) {
      idees.push(ideeCreee);
    }

    titreInput.value = "";
    catInput.value = "";
    descInput.value = "";
    document.getElementById("char-count").textContent = "0";
    [titreInput, descInput].forEach((el) => el.classList.remove("is-valid"));

    if (activeFilter !== "Tous" && activeFilter !== categorie) {
      definirFiltre("Tous");
    }

    await afficherMur();
    await afficherToast("💡 Idée publiée avec succès !", "success");
  } catch {
    await afficherToast(
      "Erreur lors de l'enregistrement de l'idée.",
      "danger"
    );
  }
}

function definirFiltre(valeur) {
  activeFilter = valeur;
  document.querySelectorAll(".filter-chip").forEach((chip) => {
    const estActif =
      chip.dataset.filter.trim().toLowerCase() ===
      valeur.trim().toLowerCase();
    chip.classList.toggle("active", estActif);
  });
}

async function ouvrirEdition(id) {
  try {
    const idee = await fetchIdeeById(id);
    editingId = id;

    document.getElementById("edit-id").value = id;
    document.getElementById("edit-title").value = idee.titre;
    document.getElementById("edit-cat").value = idee.categorie;
    document.getElementById("edit-desc").value = idee.description;

    const modal = new bootstrap.Modal(
      document.getElementById("edit-modal")
    );
    modal.show();
  } catch {
    await afficherToast(
      "Erreur lors du chargement de l'idée à modifier.",
      "danger"
    );
  }
}

async function sauvegarderEdition() {
  const titre = document.getElementById("edit-title").value.trim();
  const cat = document.getElementById("edit-cat").value;
  const desc = document.getElementById("edit-desc").value.trim();

  if (!titre || !desc) {
    await afficherToast("Titre et description sont requis.", "danger");
    return;
  }

  try {
    await updateIdee(editingId, {
      titre,
      categorie: cat,
      description: desc
    });

    const modalInstance = bootstrap.Modal.getInstance(
      document.getElementById("edit-modal")
    );
    modalInstance.hide();

    idees = []; // forcer rechargement depuis Supabase
    await afficherMur();
    await afficherToast("✏️ Idée modifiée avec succès !", "info");
  } catch {
    await afficherToast(
      "Erreur lors de la modification de l'idée.",
      "danger"
    );
  }
}

async function supprimerIdee(id) {
  deletingId = id;
  const confirme = await demanderConfirmation();
  if (!confirme) {
    deletingId = null;
    return;
  }

  try {
    await deleteIdee(id);
    deletingId = null;
    idees = idees.filter((idee) => idee.id !== id);
    await afficherMur();
    await afficherToast("🗑️ Idée supprimée.", "danger");
  } catch {
    await afficherToast(
      "Erreur lors de la suppression de l'idée.",
      "danger"
    );
  }
}

function configurerEvenements() {
  const boutonIA = document.getElementById("btn-add");
  const titreInput = document.getElementById("input-title");
  const descInput = document.getElementById("input-desc");

  boutonIA.addEventListener("click", async () => {
    const initialHTML = boutonIA.innerHTML;
    boutonIA.innerHTML =
      '<div class="spinner-grow" role="status"><span class="visually-hidden">Loading...</span></div> Analyse de l\'IA';
    boutonIA.disabled = true;

    try {
      await ajouterIdee();
    } finally {
      boutonIA.innerHTML = initialHTML;
      boutonIA.disabled = false;
    }
  });

  descInput.addEventListener("input", function () {
    document.getElementById("char-count").textContent = this.value.length;
  });

  document
    .getElementById("filter-bar")
    .addEventListener("click", async (e) => {
      const chip = e.target.closest(".filter-chip");
      if (!chip) return;
      definirFiltre(chip.dataset.filter);
      await afficherMur();
    });

  document.getElementById("ideas-grid").addEventListener("click", (e) => {
    const btnEdit = e.target.closest(".btn-edit");
    const btnDelete = e.target.closest(".btn-delete");

    if (btnEdit) ouvrirEdition(btnEdit.dataset.id);
    if (btnDelete) supprimerIdee(btnDelete.dataset.id);
  });

  document
    .getElementById("btn-save-edit")
    .addEventListener("click", () => {
      sauvegarderEdition();
    });

  titreInput.addEventListener("input", () => validerTitre(titreInput));
  descInput.addEventListener("input", () =>
    validerDescription(
      descInput,
      document.querySelector(".invalid-feedback")
    )
  );
}

async function initialiserApp() {
  await afficherMur();
  configurerEvenements();
}

document.addEventListener("DOMContentLoaded", initialiserApp);

