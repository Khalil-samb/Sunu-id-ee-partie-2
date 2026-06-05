


import {api} from "./config.js"
import { supabaseUrl } from "./config.js";
import { supabaseKey } from "./config.js";


const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

let idees        = [];   // tableau des idées en mémoire
let activeFilter = "Tous";
let editingId    = null;
let deletingId   = null;



/** Formate un timestamp (nombre) en date lisible en français */
function formaterDate(timestamp) {
  return new Date(timestamp).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

/** Retourne la classe CSS correspondant à une catégorie */
function classeCategorie(cat) {
  if (cat === "Pédagogie")              return "Pédagogie";
  if (cat === "Événement")              return "Événement";
  if (cat === "Vie de campus")          return "vie";
  if (cat === "Amélioration technique") return "Amélioration";
  return "";
}

/** Sécurise un texte pour l'afficher dans du HTML sans risque */
function securiserHTML(texte) {
  return texte
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}



function afficherToast(message, type) {
  type = type || "success";

  return new Promise(function(resolve) {
    let icones = { success: "✅", info: "ℹ️", danger: "❌" };
    let conteneur = document.getElementById("toast-container");

    let toast = document.createElement("div");
    toast.className = "toast-msg " + type;
    toast.innerHTML = "<span>" + icones[type] + "</span> " + message;

    conteneur.appendChild(toast);

    setTimeout(function() {
      toast.remove();
      resolve();
    }, 5000);
  });
}



function demanderConfirmation() {
  return new Promise(function(resolve) {
    let overlay   = document.getElementById("confirm-overlay");
    let btnOk     = document.getElementById("confirm-ok");
    let btnCancel = document.getElementById("confirm-cancel");

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
async function liredonnee(){
  let { data, error } = await supabase
  .from('Idees')
  .select('*')
  
  if(error){
    console.log(error);
  }
  idees = data
}



function creerCarteIdee(idee) {
  let carte = document.createElement("div");
  carte.className  = "idea-card";
  carte.dataset.id  = idee.id;
  carte.dataset.cat = idee.categorie;

  carte.innerHTML =
    '<div class="d-flex align-items-center justify-content-between gap-2">' +
      '<span class="cat-badge ' + classeCategorie(idee.categorie) + '">' + idee.categorie + '</span>' +
      '<span class="idea-date">' + formaterDate(idee.created_at) + '</span>' +
    '</div>' +
    '<p class="idea-title">' + idee.titre + '</p>' +
    '<p class="idea-desc">'  + idee.description  + '</p>' +
    '<div class="card-actions mt-auto">' +
      '<button class="btn-edit"   data-id="' + idee.id + '"><i class="bi bi-pencil"></i> Éditer</button>' +
      '<button class="btn-delete" data-id="' + idee.id + '"><i class="bi bi-trash3"></i> Supprimer</button>' +
    '</div>';

  return carte;
}

async function afficherMur() {

  if(idees.length ===0){
    await liredonnee();
  }
  
  let grille = document.getElementById("ideas-grid");
  let vide   = document.getElementById("empty-state");



  document.getElementById("total-count").textContent = idees.length;

  let ideesFiltrees = activeFilter === "Tous"
    ? idees
    : idees.filter(function(idee) { 
        return idee.categorie.trim().toLowerCase() === activeFilter.trim().toLocaleLowerCase(); 
      });

  // Vider les cartes existantes
  grille.querySelectorAll(".idea-card").forEach(function(carte) { carte.remove(); });

  if (ideesFiltrees.length === 0) {
    vide.style.display = "block";
    return;
  }

  vide.style.display = "none";

  [...ideesFiltrees].reverse().forEach(function(idee) {
    grille.appendChild(creerCarteIdee(idee));
  });
}



async function ajouterIdee() {
  let titre = document.getElementById("input-title").value.trim();
  let cat   = document.getElementById("input-cat").value;
  let desc  = document.getElementById("input-desc").value.trim();

  if (!titre) {
    await afficherToast("Veuillez saisir un titre.", "danger");
    return;
  }
  if (!cat) {
    await afficherToast("✏️ L'IA est en train de rechercher la catégorie adaptée.", "info");
    return;
  }
  if (!desc) {
    await afficherToast("Veuillez ajouter une description.", "danger");
    return;
  }

  
  // let nouvelleIdee = {
  //   id   : Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
  //   title: titre,
  //   cat  : cat,
  //   desc : desc,
  //   ts   : Date.now()
  // };

  // idees.push(nouvelleIdee);

const { data, error } = await supabase
  .from('Idees')
  .insert([
    { 
      "titre": titre ,
      "categorie": cat ,
      "description": desc 
    },
    
  ]);
  if(error){
    console.log(error);
  }
          

  // Réinitialiser le formulaire
  document.getElementById("input-title").value      = "";
  document.getElementById("input-cat").value        = "";
  document.getElementById("input-desc").value       = "";
  document.getElementById("char-count").textContent = "0";

  [document.getElementById("input-title"), document.getElementById("input-desc")].forEach(function(el) {
    el.classList.remove("is-valid");
  });

  if (activeFilter !== "Tous" && activeFilter !== cat) {
    definirFiltre("Tous");
  }

  await afficherMur();
  afficherToast("💡 Idée publiée avec succès !", "success");
}


function ValidationTitre() {
  const input = document.getElementById("input-title");
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

function ValidationDescr() {
  const input   = document.getElementById("input-desc");
  const value   = input.value.trim();
  const invalid = document.querySelector(".invalid-feedback");

  if (value.length < 20) {
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");
    invalid.style.display = "block";
    return false;
  }

  input.classList.remove("is-invalid");
  input.classList.add("is-valid");
  invalid.style.display = "none";
  return true;
}



function definirFiltre(valeur) {
  activeFilter = valeur;

  document.querySelectorAll(".filter-chip").forEach(function(chip) {
    //on compare en minuscules pour éviter les bugs HTML/JS
    let estActif = chip.dataset.filter.trim().toLocaleLowerCase() == valeur.trim().toLocaleLowerCase();
    chip.classList.toggle("active", estActif);
  });
}




async function ouvrirEdition(id) {
 
    // Charger l'idée depuis Supabase
  const { data, error } = await supabase
    .from('Idees')
    .select()
    .eq('id', id)
    .single(); // on récupère une seule ligne

  if (error || !data) {
    console.error("Erreur chargement idée :", error);
    return;
  }

  editingId = id;

  document.getElementById("edit-id").value    = id;
  document.getElementById("edit-title").value = data.titre;
  document.getElementById("edit-cat").value   = data.categorie;
  document.getElementById("edit-desc").value  = data.description;

  let modal = new bootstrap.Modal(document.getElementById("edit-modal"));
  modal.show();
}

async function sauvegarderEdition() {
  let titre = document.getElementById("edit-title").value.trim();
  let cat   = document.getElementById("edit-cat").value;
  let desc  = document.getElementById("edit-desc").value.trim();

  if (!titre || !desc) {
    await afficherToast("Titre et description sont requis.", "danger");
    return;
  }




   const { data, error } = await supabase
        .from('Idees')
        .update({ 'titre': titre, 'categorie': cat, 'description':desc })
        .eq('id', editingId)
        .select();

  if (error) {
    console.error("Erreur update :", error);
    await afficherToast("Erreur lors de la modification.", "danger");
    return;
  }

  bootstrap.Modal.getInstance(document.getElementById("edit-modal")).hide(); 
  await afficherMur();

  afficherToast("✏️ Idée modifiée avec succès !", "info");
}




async function supprimerIdee(id) {
  deletingId = id;

  let confirme = await demanderConfirmation();
  if (!confirme) {
    deletingId = null;
    return;
  }
  const { error } = await supabase
  .from('Idees')
  .delete()
  .eq('id', id)

 

  deletingId = null;

  await afficherMur();
  afficherToast("🗑️ Idée supprimée.", "danger");
}






const IA_CATEGORIES = ["Pédagogie", "Événement", "Vie de campus", "Amélioration technique"];

async function suggererCategorie() {
  const titre       = document.getElementById("input-title").value;
  const description = document.getElementById("input-desc").value;

  try {
    const prompt = `
      Tu es un classificateur d'idées pour une université.
      Tu dois choisir UNE seule catégorie parmi la liste suivante :

      - Pédagogie
      - Événement
      - Vie de campus
      - Amélioration technique

      Titre : ${titre}
      Description : ${description}

      Réponds uniquement par le nom EXACT d'une catégorie parmi cette liste, sans phrase supplémentaire.
    `;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${api}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "poolside/laguna-m.1:free",
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      console.error("Erreur API openrouter :", await response.text());
      return;
    }

    const data    = await response.json();
    const content = data.choices[0].message.content.trim();
    console.log("Réponse brute IA :", content);

    if (!content) return;

    let categorie = IA_CATEGORIES.find(c =>
      content.toLowerCase().includes(c.toLowerCase())
    );

    if (!categorie) {
      console.warn("Catégorie non reconnue dans la réponse :", content);
      return;
    }

    document.getElementById("input-cat").value = categorie;
    return categorie;

  } catch (err) {
    console.error("Erreur de suggestion IA :", err);
  }
}




const ia = document.getElementById("btn-add");
ia.addEventListener("click", async function () {
  const initialHTML = ia.innerHTML;

  ia.innerHTML = `<div class="spinner-grow" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div> Analyse de l'IA`;
  ia.disabled = true;

  try {
    await suggererCategorie();
    await ajouterIdee();
  } catch (err) {
    console.error("Erreur :", err);
  } finally {
    ia.innerHTML = initialHTML;
    ia.disabled  = false;
  }
});

document.getElementById("input-desc").addEventListener("input", function() {
  document.getElementById("char-count").textContent = this.value.length;
});

document.getElementById("filter-bar").addEventListener("click", async function(e) {
  let chip = e.target.closest(".filter-chip");
  if (!chip) return;
  definirFiltre(chip.dataset.filter);
  await afficherMur();
});

document.getElementById("ideas-grid").addEventListener("click", function(e) {
  let btnEdit   = e.target.closest(".btn-edit");
  let btnDelete = e.target.closest(".btn-delete");

  if (btnEdit)   ouvrirEdition(btnEdit.dataset.id);
  if (btnDelete) supprimerIdee(btnDelete.dataset.id);
});

document.getElementById("btn-save-edit").addEventListener("click", function() {
  sauvegarderEdition();
});

document.getElementById("input-title").addEventListener("input", ValidationTitre);
document.getElementById("input-desc").addEventListener("input", ValidationDescr);




async function initialiserApp() {
  // TODO : remplacer par un SELECT Supabase pour charger toutes les idées
  await afficherMur();
}

document.addEventListener("DOMContentLoaded", initialiserApp);