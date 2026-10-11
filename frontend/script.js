document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);

  // Проверь адрес своего сервера Render.
  const API_BASE = "https://auto-hub-ialy.onrender.com";

  const carsContainer = $("carsContainer");
  let cars = [];

  function readSaved(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  }

  let favorites = readSaved("favorites", []).map(Number);
  let history = readSaved("history", []).map(Number);
  const reviews = readSaved("reviews", {});

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

  const carImages = {
    1:"https://commons.wikimedia.org/wiki/Special:Redirect/file/2008-2010%20Toyota%20Yaris%20%28NCP93R%29%20YRS%20sedan%20%282010-12-28%29.jpg?width=1200",
    2:"https://commons.wikimedia.org/wiki/Special:Redirect/file/2021%20Hyundai%20Accent%20SE%20in%20Olympus%20Silver%2C%20rear%20left%2C%2008-30-2026.jpg?width=1200",
    3:"https://commons.wikimedia.org/wiki/Special:Redirect/file/2024%20Hyundai%20Sonata%2C%20rear.jpg?width=1200",
    4:"https://commons.wikimedia.org/wiki/Special:Redirect/file/%2722%20Subaru%20Forester.jpg?width=1200",
    5:"https://commons.wikimedia.org/wiki/Special:Redirect/file/2023%20Kia%20Sorento%20MQ4%201.jpg?width=1200",
    6:"https://commons.wikimedia.org/wiki/Special:Redirect/file/2020%20Volkswagen%20Golf%20Style%201.5%20Side.jpg?width=1200",
    7:"https://commons.wikimedia.org/wiki/Special:Redirect/file/2018%20Toyota%20RAV4%20%28ZSA42R%29%20GXL%202WD%20wagon%20%282018-09-17%29%2002.jpg?width=1200",
    8:"https://commons.wikimedia.org/wiki/Special:Redirect/file/2021%20Kia%20Rio%20EX%20Premium%2C%20Front%20Left%2C%2008-01-2021.jpg?width=1200",
    9:"https://commons.wikimedia.org/wiki/Special:Redirect/file/2022%20Hyundai%20Elantra%20N%20in%20Fiery%20Red%2C%20Front%20Left%2C%2004-18-2022.jpg?width=1200",
    10:"https://commons.wikimedia.org/wiki/Special:Redirect/file/2023%20Chevrolet%20Tracker%201.2%20Premier.jpg?width=1200",
    11:"https://commons.wikimedia.org/wiki/Special:Redirect/file/%2722%20Kia%20Seltos.jpg?width=1200",
    12:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Toyota%20Camry%202.5%20V%202021.jpg?width=1200"
  };

  const money = n =>
    Number(n).toLocaleString("ru-RU") + " ₸";

  const nameOf = c => `${c.brand} ${c.model}`;

  const imgOf = c => carImages[Number(c.id)] || "";

  const escapeHtml = value =>
    String(value).replace(/[&<>'"]/g, ch => ({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      "'":"&#39;",
      '"':"&quot;"
    }[ch]));

  const openModal = id => $(id).classList.remove("hidden");
  const closeModal = id => $(id).classList.add("hidden");

  function render(list = cars) {
    carsContainer.innerHTML = list.length
      ? list.map(c => `
        <article class="car-card" data-id="${Number(c.id)}">
          <img class="car-image"
               src="${imgOf(c)}"
               alt="${escapeHtml(nameOf(c))}"
               loading="lazy">

          <div class="car-card-body">
            <div class="car-title-row">
              <h2>${escapeHtml(nameOf(c))}</h2>
              <span class="year-badge">${Number(c.year)}</span>
            </div>

            <div class="specs">
              <span>⚙️ ${escapeHtml(c.transmission || "—")}</span>
              <span>⛽ ${escapeHtml(c.engine || "—")}</span>
              <span>🛣️ ${Number(c.mileage || 0).toLocaleString("ru-RU")} км</span>
            </div>

            <p class="price">${money(c.price)}</p>

            <div class="card-buttons">
              <button class="detailsBtn" data-id="${Number(c.id)}">
                Подробнее
              </button>
              <button class="favoriteBtn"
                      data-id="${Number(c.id)}"
                      aria-label="Избранное">
                ${favorites.includes(Number(c.id)) ? "💖" : "♡"}
              </button>
            </div>
          </div>
        </article>
      `).join("")
      : '<p class="empty">Автомобили не найдены.</p>';

    $("resultsCount").textContent = `${list.length} авто`;
  }

  function applyFilters() {
    const q = $("searchInput").value.toLowerCase().trim();
    const min = Number($("minPrice").value) || 0;
    const max = Number($("maxPrice").value) || Infinity;

    let list = cars.filter(c =>
      nameOf(c).toLowerCase().includes(q) &&
      Number(c.price) >= min &&
      Number(c.price) <= max
    );

    const sort = $("sortPrice").value;

    if (sort === "asc") {
      list.sort((a, b) => a.price - b.price);
    }
    if (sort === "desc") {
      list.sort((a, b) => b.price - a.price);
    }
    if (sort === "year") {
      list.sort((a, b) => b.year - a.year);
    }

    render(list);
  }

  async function loadCars() {
    try {
      const response = await fetch(`${API_BASE}/api/cars`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Неверный формат каталога");
      }

      cars = data.length ? data : fallbackCars;
      $("apiStatus").textContent =
        "Каталог загружен из базы данных";
    } catch (error) {
      console.error("Ошибка загрузки автомобилей:", error);
      cars = fallbackCars;
      $("apiStatus").textContent =
        "Демо-режим: каталог работает без сервера";
    }

    applyFilters();
  }

  ["searchInput", "minPrice", "maxPrice"].forEach(id => {
    $(id).addEventListener("input", applyFilters);
  });

  $("filterBtn").addEventListener("click", applyFilters);
  $("sortPrice").addEventListener("change", applyFilters);

  $("resetBtn").addEventListener("click", () => {
    $("searchInput").value = "";
    $("minPrice").value = "";
    $("maxPrice").value = "";
    $("sortPrice").value = "";
    applyFilters();
  });

  $("loginBtn").addEventListener("click", () =>
    openModal("loginModal")
  );

  $("registerBtn").addEventListener("click", () =>
    openModal("registerModal")
  );

  document.querySelectorAll("[data-close]").forEach(button => {
    button.addEventListener("click", () =>
      closeModal(button.dataset.close)
    );
  });

  document.querySelectorAll(".modal").forEach(modal => {
    modal.addEventListener("click", event => {
      if (event.target === modal) closeModal(modal.id);
    });
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      document.querySelectorAll(".modal:not(.hidden)")
        .forEach(modal => closeModal(modal.id));
    }
  });

  function openDetails(car) {
    history = [
      Number(car.id),
      ...history.filter(id => id !== Number(car.id))
    ].slice(0, 10);

    localStorage.setItem("history", JSON.stringify(history));

    const saved = reviews[car.id] || {};
    let rating = saved.rating || 0;

    $("detailsContent").innerHTML = `
      <img class="details-image"
           src="${imgOf(car)}"
           alt="${escapeHtml(nameOf(car))}">

      <h2>${escapeHtml(nameOf(car))}</h2>

      <div class="detail-grid">
        <p><strong>Год</strong><br>${Number(car.year)}</p>
        <p><strong>Двигатель</strong><br>${escapeHtml(car.engine || "—")}</p>
        <p><strong>Коробка</strong><br>${escapeHtml(car.transmission || "—")}</p>
        <p><strong>Пробег</strong><br>${Number(car.mileage || 0).toLocaleString("ru-RU")} км</p>
      </div>

      <p class="price">${money(car.price)}</p>
      <hr>
      <h3>Оставить отзыв</h3>

      <div class="review-stars" id="reviewStars">
        ${[1,2,3,4,5].map(n => `
          <button type="button"
                  data-star="${n}"
                  class="star ${n <= rating ? "active" : ""}">
            ★
          </button>
        `).join("")}
      </div>

      <textarea id="reviewText"
                maxlength="300"
                placeholder="Ваш отзыв...">${escapeHtml(saved.text || "")}</textarea>

      <button id="saveReviewBtn">Сохранить отзыв</button>
      <p id="reviewMessage" class="message"></p>
    `;

    $("reviewStars").addEventListener("click", event => {
      const star = event.target.closest("[data-star]");
      if (!star) return;

      rating = Number(star.dataset.star);

      document.querySelectorAll(".star").forEach(button => {
        button.classList.toggle(
          "active",
          Number(button.dataset.star) <= rating
        );
      });
    });

    $("saveReviewBtn").addEventListener("click", () => {
      if (!rating) {
        $("reviewMessage").textContent =
          "Выберите оценку от 1 до 5.";
        return;
      }

      reviews[car.id] = {
        rating,
        text: $("reviewText").value.trim()
      };

      localStorage.setItem("reviews", JSON.stringify(reviews));
      $("reviewMessage").textContent = "Отзыв сохранён ✓";
    });

    openModal("detailsModal");
  }

  carsContainer.addEventListener("click", event => {
    const button = event.target.closest("[data-id]");
    if (!button) return;

    const id = Number(button.dataset.id);
    const car = cars.find(c => Number(c.id) === id);
    if (!car) return;

    if (button.classList.contains("detailsBtn")) {
      openDetails(car);
    }

    if (button.classList.contains("favoriteBtn")) {
      favorites = favorites.includes(id)
        ? favorites.filter(x => x !== id)
        : [...favorites, id];

      localStorage.setItem("favorites", JSON.stringify(favorites));
      applyFilters();
    }
  });

  function renderMiniCars(ids) {
    const list = ids
      .map(id => cars.find(c => Number(c.id) === Number(id)))
      .filter(Boolean);

    return list.map(c => `
      <div class="mini-car">
        <img src="${imgOf(c)}" alt="${escapeHtml(nameOf(c))}">
        <span>
          <strong>${escapeHtml(nameOf(c))}</strong>
          <br>${money(c.price)}
        </span>
      </div>
    `).join("");
  }

  $("favoritesBtn").addEventListener("click", () => {
    $("favoritesContent").innerHTML =
      renderMiniCars(favorites) || "Пока ничего не добавлено.";

    openModal("favoritesModal");
  });

  $("historyBtn").addEventListener("click", () => {
    $("historyContent").innerHTML =
      renderMiniCars(history) || "История пока пуста.";

    openModal("historyModal");
  });

  // Регистрация и вход через сервер Render
  async function auth(endpoint, username, password, messageEl) {
    messageEl.textContent = "Подождите...";

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      messageEl.textContent =
        data.message ||
        data.error ||
        (response.ok ? "Успешно!" : "Ошибка авторизации");

      return response.ok ? data : null;

    } catch (error) {
      console.error("Ошибка авторизации:", error);

      messageEl.textContent =
        "Не удалось связаться с Render. Проверьте адрес API, CORS и работу сервера.";

      return null;
    }
  }

  $("submitRegister").addEventListener("click", async () => {
    const username = $("registerUsername").value.trim();
    const password = $("registerPassword").value;

    if (!username || !password) {
      $("registerMessage").textContent =
        "Введите логин и пароль";
      return;
    }

    if (password.length < 6) {
      $("registerMessage").textContent =
        "Пароль должен содержать минимум 6 символов";
      return;
    }

    const data = await auth(
      "/api/register",
      username,
      password,
      $("registerMessage")
    );

    if (data) {
      $("registerUsername").value = "";
      $("registerPassword").value = "";

      $("registerMessage").textContent =
        "Регистрация успешна! Теперь войдите в аккаунт.";
    }
  });

  $("submitLogin").addEventListener("click", async () => {
    const username = $("loginUsername").value.trim();
    const password = $("loginPassword").value;

    if (!username || !password) {
      $("loginMessage").textContent =
        "Введите логин и пароль";
      return;
    }

    const data = await auth(
      "/api/login",
      username,
      password,
      $("loginMessage")
    );

    if (data) {
      localStorage.setItem(
        "currentUser",
        data.username || username
      );

      $("loginPassword").value = "";
      updateUser();
      closeModal("loginModal");
    }
  });

  $("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    updateUser();
  });

  function updateUser() {
    const username = localStorage.getItem("currentUser");

    $("userStatus").textContent = username
      ? `Здравствуйте, ${username}!`
      : "";

    $("logoutBtn").classList.toggle("hidden", !username);
    $("loginBtn").classList.toggle("hidden", !!username);
    $("registerBtn").classList.toggle("hidden", !!username);
  }

  function demoContact(event) {
    event.preventDefault();

    alert(
      "Демо-функция Auto Hub\n\n" +
      "Контакт продавца пока не настроен."
    );
  }

  $("whatsappLink").addEventListener("click", demoContact);
  $("telegramLink").addEventListener("click", demoContact);

  $("year").textContent = new Date().getFullYear();

  updateUser();
  loadCars();
});
