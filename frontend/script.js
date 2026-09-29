document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);
  const carsContainer = $("carsContainer");
  let cars = [];
  let favorites = JSON.parse(localStorage.getItem("favorites") || "[]").map(Number);
  let history = JSON.parse(localStorage.getItem("history") || "[]").map(Number);
  const reviews = JSON.parse(localStorage.getItem("reviews") || "{}");

  const fallbackCars = [
    {id:1,brand:"Toyota",model:"Yaris",year:2010,engine:"1.5 л",transmission:"Автомат",mileage:150000,price:3500000},
    {id:2,brand:"Hyundai",model:"Accent",year:2021,engine:"1.6 л",transmission:"Автомат",mileage:62000,price:7800000},
    {id:3,brand:"Hyundai",model:"Sonata N Line",year:2024,engine:"2.5 л",transmission:"Робот",mileage:8000,price:18900000},
    {id:4,brand:"Subaru",model:"Forester",year:2022,engine:"2.5 л",transmission:"Вариатор",mileage:41000,price:15400000},
    {id:5,brand:"Kia",model:"Sorento",year:2023,engine:"2.5 л",transmission:"Автомат",mileage:26000,price:20900000},
    {id:6,brand:"Volkswagen",model:"Golf",year:2020,engine:"1.4 л",transmission:"Автомат",mileage:57000,price:11200000},
    {id:7,brand:"Toyota",model:"RAV4",year:2018,engine:"2.0 л",transmission:"Вариатор",mileage:98000,price:13900000},
    {id:8,brand:"Kia",model:"Rio",year:2020,engine:"1.6 л",transmission:"Автомат",mileage:72000,price:7200000},
    {id:9,brand:"Hyundai",model:"Elantra",year:2022,engine:"1.6 л",transmission:"Автомат",mileage:38000,price:10300000},
    {id:10,brand:"Chevrolet",model:"Tracker",year:2023,engine:"1.2 л Turbo",transmission:"Автомат",mileage:22000,price:10800000},
    {id:11,brand:"Kia",model:"Seltos",year:2022,engine:"2.0 л",transmission:"Вариатор",mileage:45000,price:12800000},
    {id:12,brand:"Toyota",model:"Camry",year:2021,engine:"2.5 л",transmission:"Автомат",mileage:64000,price:16800000}
  ];

  const money = n => Number(n).toLocaleString("ru-RU") + " ₸";
  const nameOf = c => `${c.brand} ${c.model}`;
  const carImages = {
    1: "https://commons.wikimedia.org/wiki/Special:Redirect/file/2008-2010%20Toyota%20Yaris%20%28NCP93R%29%20YRS%20sedan%20%282010-12-28%29.jpg?width=1200",
    2: "https://commons.wikimedia.org/wiki/Special:Redirect/file/2021%20Hyundai%20Accent%20SE%20in%20Olympus%20Silver%2C%20rear%20left%2C%2008-30-2026.jpg?width=1200",
    3: "https://commons.wikimedia.org/wiki/Special:Redirect/file/2024%20Hyundai%20Sonata%2C%20rear.jpg?width=1200",
    4: "https://commons.wikimedia.org/wiki/Special:Redirect/file/%2722%20Subaru%20Forester.jpg?width=1200",
    5: "https://commons.wikimedia.org/wiki/Special:Redirect/file/2023%20Kia%20Sorento%20MQ4%201.jpg?width=1200",
    6: "https://commons.wikimedia.org/wiki/Special:Redirect/file/2020%20Volkswagen%20Golf%20Style%201.5%20Side.jpg?width=1200",
    7: "https://commons.wikimedia.org/wiki/Special:Redirect/file/2018%20Toyota%20RAV4%20%28ZSA42R%29%20GXL%202WD%20wagon%20%282018-09-17%29%2002.jpg?width=1200",
    8: "https://commons.wikimedia.org/wiki/Special:Redirect/file/2021%20Kia%20Rio%20EX%20Premium%2C%20Front%20Left%2C%2008-01-2021.jpg?width=1200",
    9: "https://commons.wikimedia.org/wiki/Special:Redirect/file/2022%20Hyundai%20Elantra%20N%20in%20Fiery%20Red%2C%20Front%20Left%2C%2004-18-2022.jpg?width=1200",
    10: "https://commons.wikimedia.org/wiki/Special:Redirect/file/2023%20Chevrolet%20Tracker%201.2%20Premier.jpg?width=1200",
    11: "https://commons.wikimedia.org/wiki/Special:Redirect/file/%2722%20Kia%20Seltos.jpg?width=1200",
    12: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Toyota%20Camry%202.5%20V%202021.jpg?width=1200"
  };
  const imgOf = c => carImages[Number(c.id)] || "";
  const openModal = id => $(id).classList.remove("hidden");
  const closeModal = id => $(id).classList.add("hidden");
  const escapeHtml = value => String(value).replace(/[&<>'"]/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[ch]));

  function render(list = cars) {
    carsContainer.innerHTML = list.length ? list.map(c => `
      <article class="car-card" data-id="${c.id}">
        <img class="car-image" src="${imgOf(c)}" alt="${escapeHtml(nameOf(c))}" loading="lazy">
        <div class="car-card-body">
          <div class="car-title-row"><h2>${escapeHtml(nameOf(c))}</h2><span class="year-badge">${c.year}</span></div>
          <div class="specs"><span>⚙️ ${escapeHtml(c.transmission || "—")}</span><span>⛽ ${escapeHtml(c.engine || "—")}</span><span>🛣️ ${Number(c.mileage || 0).toLocaleString("ru-RU")} км</span></div>
          <p class="price">${money(c.price)}</p>
          <div class="card-buttons"><button class="detailsBtn" data-id="${c.id}">Подробнее</button><button class="favoriteBtn" data-id="${c.id}" aria-label="Избранное">${favorites.includes(Number(c.id)) ? "💖" : "♡"}</button></div>
        </div>
      </article>`).join("") : '<p class="empty">По вашему запросу автомобили не найдены.</p>';
    $("resultsCount").textContent = `${list.length} авто`;
  }

  function applyFilters() {
    const q = $("searchInput").value.toLowerCase().trim();
    const min = Number($("minPrice").value) || 0;
    const max = Number($("maxPrice").value) || Infinity;
    let list = cars.filter(c => nameOf(c).toLowerCase().includes(q) && Number(c.price) >= min && Number(c.price) <= max);
    if ($("sortPrice").value === "asc") list.sort((a,b) => a.price-b.price);
    if ($("sortPrice").value === "desc") list.sort((a,b) => b.price-a.price);
    if ($("sortPrice").value === "year") list.sort((a,b) => b.year-a.year);
    render(list);
  }

  async function loadCars() {
    try {
      const r = await fetch("/api/cars", {signal: AbortSignal.timeout ? AbortSignal.timeout(2500) : undefined});
      if (!r.ok) throw new Error("API недоступен");
      const apiCars = await r.json();
      cars = apiCars.length ? apiCars : fallbackCars;
      $("apiStatus").textContent = "Каталог загружен из базы данных";
    } catch (e) {
      cars = fallbackCars;
      $("apiStatus").textContent = "Демо-режим: каталог работает без сервера";
    }
    render();
  }

  ["searchInput","minPrice","maxPrice"].forEach(id => $(id).addEventListener("input", applyFilters));
  $("filterBtn").addEventListener("click", applyFilters);
  $("sortPrice").addEventListener("change", applyFilters);
  $("resetBtn").addEventListener("click", () => { $("searchInput").value=""; $("minPrice").value=""; $("maxPrice").value=""; $("sortPrice").value=""; render(); });

  $("loginBtn").addEventListener("click", () => openModal("loginModal"));
  $("registerBtn").addEventListener("click", () => openModal("registerModal"));
  document.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", () => closeModal(b.dataset.close)));
  document.querySelectorAll(".modal").forEach(m => m.addEventListener("click", e => { if (e.target === m) closeModal(m.id); }));
  document.addEventListener("keydown", e => { if(e.key === "Escape") document.querySelectorAll(".modal:not(.hidden)").forEach(m => closeModal(m.id)); });

  function openDetails(car) {
    history = [Number(car.id), ...history.filter(x => x !== Number(car.id))].slice(0,10);
    localStorage.setItem("history", JSON.stringify(history));
    const saved = reviews[car.id] || {};
    $("detailsContent").innerHTML = `
      <img class="details-image" src="${imgOf(car)}" alt="${escapeHtml(nameOf(car))}">
      <h2>${escapeHtml(nameOf(car))}</h2>
      <div class="detail-grid"><p><strong>Год</strong><br>${car.year}</p><p><strong>Двигатель</strong><br>${escapeHtml(car.engine || "—")}</p><p><strong>Коробка</strong><br>${escapeHtml(car.transmission || "—")}</p><p><strong>Пробег</strong><br>${Number(car.mileage || 0).toLocaleString("ru-RU")} км</p></div>
      <p class="price">${money(car.price)}</p>
      <hr><h3>Оставить отзыв</h3>
      <div class="review-stars" id="reviewStars">${[1,2,3,4,5].map(n=>`<button type="button" data-star="${n}" class="star ${n <= (saved.rating||0) ? "active" : ""}">★</button>`).join("")}</div>
      <textarea id="reviewText" maxlength="300" placeholder="Ваш отзыв...">${escapeHtml(saved.text || "")}</textarea>
      <button id="saveReviewBtn">Сохранить отзыв</button><p id="reviewMessage" class="message"></p>`;
    let rating = saved.rating || 0;
    $("reviewStars").addEventListener("click", e => { if(!e.target.dataset.star) return; rating=Number(e.target.dataset.star); document.querySelectorAll(".star").forEach(s=>s.classList.toggle("active",Number(s.dataset.star)<=rating)); });
    $("saveReviewBtn").addEventListener("click", () => { const text=$("reviewText").value.trim(); if(!rating){$("reviewMessage").textContent="Выберите оценку от 1 до 5.";return;} reviews[car.id]={rating,text}; localStorage.setItem("reviews",JSON.stringify(reviews)); $("reviewMessage").textContent="Отзыв сохранён ✓"; });
    openModal("detailsModal");
  }

  carsContainer.addEventListener("click", e => {
    const id = Number(e.target.dataset.id); if (!id) return;
    const car = cars.find(c => Number(c.id) === id); if (!car) return;
    if (e.target.classList.contains("detailsBtn")) openDetails(car);
    if (e.target.classList.contains("favoriteBtn")) { favorites = favorites.includes(id) ? favorites.filter(x=>x!==id) : [...favorites,id]; localStorage.setItem("favorites",JSON.stringify(favorites)); applyFilters(); }
  });

  $("favoritesBtn").addEventListener("click", () => { const list=favorites.map(id=>cars.find(c=>Number(c.id)===id)).filter(Boolean); $("favoritesContent").innerHTML=list.length?list.map(c=>`<div class="mini-car"><img src="${imgOf(c)}" alt=""><span><strong>${escapeHtml(nameOf(c))}</strong><br>${money(c.price)}</span></div>`).join(""):"Пока ничего не добавлено."; openModal("favoritesModal"); });
  $("historyBtn").addEventListener("click", () => { const list=history.map(id=>cars.find(c=>Number(c.id)===id)).filter(Boolean); $("historyContent").innerHTML=list.length?list.map(c=>`<div class="mini-car"><img src="${imgOf(c)}" alt=""><span><strong>${escapeHtml(nameOf(c))}</strong><br>${money(c.price)}</span></div>`).join(""):"История пока пуста."; openModal("historyModal"); });

  async function auth(url, username, password, messageEl) {
    messageEl.textContent="Подождите...";
    try { const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username,password})}); const data=await r.json(); messageEl.textContent=data.message||data.error||"Ошибка"; return r.ok?data:null; }
    catch(e){ messageEl.textContent="Для входа и регистрации запустите Docker. Остальной каталог доступен в демо-режиме."; return null; }
  }
  $("submitRegister").addEventListener("click", async()=>{const u=$("registerUsername").value.trim(),p=$("registerPassword").value;if(!u||!p){$("registerMessage").textContent="Введите логин и пароль";return;}if(p.length<4){$("registerMessage").textContent="Пароль — минимум 4 символа";return;}const data=await auth("/api/register",u,p,$("registerMessage"));if(data){$("registerUsername").value="";$("registerPassword").value="";}});
  $("submitLogin").addEventListener("click", async()=>{const u=$("loginUsername").value.trim(),p=$("loginPassword").value;if(!u||!p){$("loginMessage").textContent="Введите логин и пароль";return;}const data=await auth("/api/login",u,p,$("loginMessage"));if(data){localStorage.setItem("currentUser",data.username);updateUser();setTimeout(()=>closeModal("loginModal"),500);}});
  $("logoutBtn").addEventListener("click",()=>{localStorage.removeItem("currentUser");updateUser();});
  function updateUser(){const u=localStorage.getItem("currentUser");$("userStatus").textContent=u?`Здравствуйте, ${u}!`:"";$("logoutBtn").classList.toggle("hidden",!u);$("loginBtn").classList.toggle("hidden",!!u);$("registerBtn").classList.toggle("hidden",!!u);}

  const demoContact = (event) => {
  event.preventDefault();
  alert(
    "Демо-функция Auto Hub\n\n" +
    "В реальном проекте здесь открывается прямой чат с продавцом. " +
    "Контакт WhatsApp или Telegram настраивается владельцем сайта."
  );
};

$("whatsappLink").addEventListener("click", demoContact);
$("telegramLink").addEventListener("click", demoContact);
  $("year").textContent = new Date().getFullYear();
  updateUser(); loadCars();
});
