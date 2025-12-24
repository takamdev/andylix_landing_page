const API_BASE = "https://andylix-landing-page.vercel.app";

const form = document.getElementById("keyForm");
const msg = document.getElementById("adminMsg");

const statsDiv = document.getElementById("stats");
const waitlistBox = document.getElementById("waitlistBox");
const surveysBox = document.getElementById("surveysBox");
const statsBox = document.getElementById("statsBox");
const decharge = document.getElementById("decharge");
const listage =document.getElementById("listage");

function card(title, value) {
   return `
    <div class="card">
      <div class="muted" style="font-weight:900;margin-bottom:6px;">${title}</div>
      <div style="font-size:28px;font-weight:1000;">${value}</div>
    </div>
  `;
}

function card_waitlist(data) {
   return `<div class="card" style="margin-bottom:10px;">
            <div class="contenu" >
                <div>
                  <img width="44" height="44" src="assects/avatar.png" alt="avatar" />
                </div>

                <div style="margin-left:10px;">
                  <p> <span style="color:var(#9aa7bd);text-decoration:none;font-weight:850">Nom:</span>  <span style="font-size: 12px;"> ${
                     data.name.charAt(0).toUpperCase() + data.name.slice(1)
                  }</span> </p>
                  <p> <span  style="color:var(#9aa7bd);text-decoration:none;font-weight:850">Email:</span> <span style="font-size: 12px;"> ${data.email.toLowerCase()}</span>  </p>
                  <p> <span  style="color:var(#9aa7bd);text-decoration:none;font-weight:850">Rolle:</span><span style="font-size: 12px;"> ${data.role.toLowerCase()}</span></p>
                </div>
            </div>
          </div>
      `;
}
function card_surveys(data) {
   return `<div class="card" style="margin-bottom:10px; panding-bottom:0px;">
            <div class="contenu">
             <div>
                <img src="assects/avatar.png" width="44" height="44" alt="avatar" />
              </div>

               <div style="margin-left:10px;">
                  <p> <span style="color:var(#9aa7bd);text-decoration:none;font-weight:850">Profil:</span>  <span style="font-size: 14px;"> ${data.persona}</span> </p>
                  <p> <span  style="color:var(#9aa7bd);text-decoration:none;font-weight:850">Besoin:</span> <span style="font-size: 14px;"> ${data.frequency}</span>  </p>
                  <p> <span  style="color:var(#9aa7bd);text-decoration:none;font-weight:850">Problemes:</span><span style="font-size: 14px;"> ${data.pain}</span></p>
                  <p> <span  style="color:var(#9aa7bd);text-decoration:none;font-weight:850">prêt a utiliser:</span><span style="font-size: 14px;"> ${data.intent}</span></p>           
                  <p> <span  style="color:var(#9aa7bd);text-decoration:none;font-weight:850">Service souhaiter:</span><span style="font-size: 14px;"> ${data.service}</span></p>
                  <p> <span  style="color:var(#9aa7bd);text-decoration:none;font-weight:850">Commentaire:</span><span style="font-size: 14px;"> ${data.comment}</span></p>
                </div>
            </div>
      </div>
      `;
}
function card_stats(data) {
  
   return `<div class="card">
          <p> <span style="color:var(#9aa7bd);text-decoration:none;font-weight:850">TotalWaitlist</span>:<span style="color:var(#9aa7bd);text-decoration:none;font-weight:750"> ${data.totalWaitlist||0}</span></p>
          <p> <span  style="color:var(#9aa7bd);text-decoration:none;font-weight:850" >TotalSurveys</span>:<span style="color:var(#9aa7bd);text-decoration:none;font-weight:750"> ${data.totalSurveys||0}</span></p>
          <p> <span  style="color:var(#9aa7bd);text-decoration:none;font-weight:850" >Artisan</span>(s):<span style="color:var(#9aa7bd);text-decoration:none;font-weight:750"> ${data.byPersona.artisan||0}</span></p>
          <p> <span  style="color:var(#9aa7bd);text-decoration:none;font-weight:850" >Client</span>(s):<span style="color:var(#9aa7bd);text-decoration:none;font-weight:750"> ${data.byPersona.client||0}</span></p>
          <p> <span  style="color:var(#9aa7bd);text-decoration:none;font-weight:850" >PME</span>:<span style="color:var(#9aa7bd);text-decoration:none;font-weight:750"> ${data.byPersona.pme||0}</span></p>
          <p> <span  style="color:var(#9aa7bd);text-decoration:none;font-weight:850" >Informatique</span>:<span style="color:var(#9aa7bd);text-decoration:none;font-weight:750"> ${data.byService.informatique||0}</span></p>
          <p> <span  style="color:var(#9aa7bd);text-decoration:none;font-weight:850" >Plomberie</span>:<span style="color:var(#9aa7bd);text-decoration:none;font-weight:750"> ${data.byService.plomberie||0}</span></p>
          <p> <span  style="color:var(#9aa7bd);text-decoration:none;font-weight:850" >Electricite</span>:<span style="color:var(#9aa7bd);text-decoration:none;font-weight:750"> ${data.byService.electricite||0}</span></p>
          <p> <span  style="color:var(#9aa7bd);text-decoration:none;font-weight:850" >Climatisation</span>:<span style="color:var(#9aa7bd);text-decoration:none;font-weight:750"> ${data.byService.clim||0}</span></p>
          <p> <span  style="color:var(#9aa7bd);text-decoration:none;font-weight:850" >Nettoyage</span>:<span style="color:var(#9aa7bd);text-decoration:none;font-weight:750"> ${data.byService.nettoyage||0}</span></p>
          <p> <span  style="color:var(#9aa7bd);text-decoration:none;font-weight:850" >Menuiserie</span>:<span style="color:var(#9aa7bd);text-decoration:none;font-weight:750"> ${data.byService.menuiserie||0}</span></p>


      </div>
      `;
}
form.addEventListener("submit", async (e) => {
   e.preventDefault();
   msg.textContent = "Chargement...";

   const key = new FormData(form).get("key");

   try {
      // full admin data
      const res = await fetch(`${API_BASE}/api/admin`, {
         headers: { "x-admin-key": key },
      });
      const data = await res.json();

      if (!res.ok) {
         msg.textContent = `${data.error || "Unauthorized"}`;
         return;
      }

      // stats endpoint (public)
      const statsRes = await fetch(`${API_BASE}/api/stats`);
      const stats = await statsRes.json();

      msg.textContent = "✅ Données chargées.";

      statsDiv.innerHTML =
         card("Total Waitlist", data.totalWaitlist) +
         card("Total Surveys", data.totalSurveys) +
         card("Top Persona", topKey(stats.byPersona));

      waitlistBox.innerHTML = data.waitlist
         .map((data) => {
            return card_waitlist(data);
         })
         .join("");

      surveysBox.innerHTML = data.surveys
         .map((data) => {
            return card_surveys(data);
         })
         .join("");

      statsBox.innerHTML = card_stats(stats);

      listage.classList.remove("hidden")

   } catch (err) {
      msg.textContent = "Erreur réseau. Vérifie que le backend tourne.";
   }
});

function topKey(obj) {
   if (!obj) return "-";
   let best = "-";
   let max = -1;
   for (const k of Object.keys(obj)) {
      if (obj[k] > max) {
         max = obj[k];
         best = `${k} (${obj[k]})`;
      }
   }
   return best;
}

decharge.addEventListener("click",()=>{
  listage.classList.add("hidden")
})