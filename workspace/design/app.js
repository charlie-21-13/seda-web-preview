const APP_LANG = "en";

const POSTS = [
  {
    id: "1",
    type: "study",
    nickname: "Minh_92",
    initial: "M",
    avatarColor: "#2563eb",
    time: "2h ago",
    title: "Why is the particle '에서' used in this sentence?",
    body: "It's from textbook unit 3. I'm confused about the difference between '학교에 갑니다' and '학교에서 공부합니다' — they feel similar in Vietnamese.",
    lang: "vi",
    likes: 24,
    comments: 8,
    liked: false,
    image: null,
  },
  {
    id: "2",
    type: "life",
    nickname: "Raj_EPS",
    initial: "R",
    avatarColor: "#7c3aed",
    time: "5h ago",
    title: "외국인등록증 발급 방법 정리했어요",
    titleTranslated: "How to get your Alien Registration Card — step by step",
    body: "출입국 사무소 예약부터 필요 서류, 당일 순서까지 단계별로 적어봤습니다. 처음 오신 분들 참고하세요.",
    bodyTranslated:
      "I wrote down each step from booking at the immigration office to required documents and what to do on the day. Hope this helps if it's your first time.",
    lang: "ko",
    likes: 76,
    comments: 12,
    liked: true,
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: "3",
    type: "job",
    nickname: "Ana_KR",
    initial: "A",
    avatarColor: "#059669",
    time: "15h ago",
    title: "H-2 visa renewal experience",
    body: "I renewed my H-2 visa last month. Sharing the documents I prepared and how long each step took. Hope this helps fellow workers.",
    lang: "en",
    likes: 41,
    comments: 6,
    liked: false,
    image: null,
  },
  {
    id: "4",
    type: "study",
    nickname: "Sokha2024",
    initial: "S",
    avatarColor: "#d97706",
    time: "May 21",
    title: "듣기 — 짧은 대화 문제 팁",
    titleTranslated: "Listening — tips for short dialogue questions",
    body: "키워드만 먼저 들으면 정답률이 올라갔어요. 특히 숫자·장소 이름을 메모하는 습관을 추천합니다.",
    bodyTranslated:
      "Listening for keywords first improved my accuracy. I recommend noting numbers and place names in particular.",
    lang: "ko",
    likes: 18,
    comments: 3,
    liked: false,
    image: null,
  },
  {
    id: "5",
    type: "life",
    nickname: "Maria_PH",
    initial: "M",
    avatarColor: "#db2777",
    time: "May 20",
    title: "겨울철 난방비 아끼는 방법",
    titleTranslated: "How to save on heating in winter",
    body: "원룸에서 전기요금이 많이 나왔던 경험 공유합니다. 단열테이프와 시간대별 사용이 효과 있었어요.",
    bodyTranslated:
      "Sharing my experience with high electric bills in a studio. Weather stripping and using heat at off-peak times helped.",
    lang: "ko",
    likes: 33,
    comments: 9,
    liked: false,
    image: null,
  },
];

const TYPE_LABELS = {
  study: "학습 질문",
  life: "한국 생활",
  job: "취업 정보",
};

let activeFilter = "all";
let searchQuery = "";
let searchOpen = false;
const translationState = {};

/** Show translate only when app is English and the post is written in Korean. */
function needsTranslation(post) {
  return APP_LANG === "en" && post.lang === "ko" && post.bodyTranslated;
}

function heartIcon(filled) {
  if (filled) {
    return `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
}

function commentIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function shareIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function getTitleText(post) {
  const showingTranslation = translationState[post.id];
  if (showingTranslation && post.titleTranslated) return post.titleTranslated;
  return post.title;
}

function getBodyText(post) {
  const showingTranslation = translationState[post.id];
  if (showingTranslation && post.bodyTranslated) return post.bodyTranslated;
  return post.body;
}

function getBodyLang(post) {
  const showingTranslation = translationState[post.id];
  if (showingTranslation && post.bodyTranslated) return APP_LANG;
  return post.lang;
}

function renderPost(post) {
  const showTranslate = needsTranslation(post);
  const isTranslated = translationState[post.id];
  const titleText = getTitleText(post);
  const bodyText = getBodyText(post);
  const bodyLang = getBodyLang(post);

  const mediaHtml = post.image
    ? `<div class="post__media"><img src="${post.image}" alt="" loading="lazy" /></div>`
    : "";

  const translateHtml = showTranslate
    ? `<button type="button" class="post__translate" data-translate="${post.id}">
        ${isTranslated ? "View original" : "View translation"}
      </button>`
    : "";

  const showTypeBadge = activeFilter === "all";
  const badgeHtml = showTypeBadge
    ? `<span class="post__badge post__badge--${post.type}">${TYPE_LABELS[post.type]}</span>`
    : "";

  return `
    <article class="post" data-post-id="${post.id}" data-type="${post.type}">
      <header class="post__header">
        <div class="post__avatar" style="background:${post.avatarColor}">${post.initial}</div>
        <div class="post__meta">
          <span class="post__nickname">${post.nickname}</span>
          <span class="post__time">${post.time}</span>
          ${badgeHtml}
        </div>
        <button type="button" class="post__more" aria-label="더보기">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
        </button>
      </header>
      <h2 class="post__title">${titleText}</h2>
      <p class="post__body post__body--preview" lang="${bodyLang}" data-body>${bodyText}</p>
      ${translateHtml}
      ${mediaHtml}
      <div class="post__actions">
        <button type="button" class="post__action ${post.liked ? "is-liked" : ""}" data-like="${post.id}" aria-label="좋아요">
          ${heartIcon(post.liked)}
          <span>${post.likes}</span>
        </button>
        <button type="button" class="post__action" data-comment="${post.id}" aria-label="댓글">
          ${commentIcon()}
          <span>${post.comments}</span>
        </button>
        <button type="button" class="post__action" aria-label="공유">
          ${shareIcon()}
        </button>
      </div>
    </article>
  `;
}

function matchesSearch(post, query) {
  const haystack = [
    post.title,
    post.body,
    post.nickname,
    post.titleTranslated,
    post.bodyTranslated,
    TYPE_LABELS[post.type],
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function getFilteredPosts() {
  let posts = activeFilter === "all" ? POSTS : POSTS.filter((p) => p.type === activeFilter);

  const q = searchQuery.trim().toLowerCase();
  if (q) {
    posts = posts.filter((p) => matchesSearch(p, q));
  }

  return posts;
}

function renderFeed() {
  const feed = document.getElementById("feed");
  const posts = getFilteredPosts();

  if (posts.length === 0) {
    const emptyMsg = searchQuery.trim()
      ? "No posts match your search."
      : "No posts in this category.";
    feed.innerHTML = `<p class="feed-empty">${emptyMsg}</p>`;
    return;
  }

  feed.innerHTML = posts.map(renderPost).join("");
}

function updateSearchClearVisibility() {
  const clearBtn = document.getElementById("search-clear");
  if (clearBtn) clearBtn.hidden = !searchQuery.trim();
}

function setSearchOpen(open) {
  searchOpen = open;
  const chipsRow = document.getElementById("filter-chips");
  const searchPanel = document.getElementById("filter-search");
  const searchToggle = document.getElementById("search-toggle");
  const searchInput = document.getElementById("search-input");

  if (!searchPanel || !searchToggle) return;

  searchPanel.hidden = !open;
  chipsRow?.classList.toggle("is-search-open", open);
  searchToggle.classList.toggle("is-active", open || !!searchQuery.trim());
  searchToggle.setAttribute("aria-expanded", String(open));

  if (open) {
    requestAnimationFrame(() => searchInput?.focus());
  } else if (!searchQuery.trim()) {
    searchToggle.classList.remove("is-active");
  }
}

function clearSearch() {
  searchQuery = "";
  const searchInput = document.getElementById("search-input");
  if (searchInput) searchInput.value = "";
  updateSearchClearVisibility();
  renderFeed();
}

function initSearch() {
  const searchToggle = document.getElementById("search-toggle");
  const searchPanel = document.getElementById("filter-search");
  const searchInput = document.getElementById("search-input");
  const searchClear = document.getElementById("search-clear");

  searchToggle?.addEventListener("click", () => {
    if (searchOpen) {
      if (searchQuery.trim()) {
        clearSearch();
      }
      setSearchOpen(false);
    } else {
      setSearchOpen(true);
    }
  });

  searchInput?.addEventListener("input", () => {
    searchQuery = searchInput.value;
    updateSearchClearVisibility();
    const toggle = document.getElementById("search-toggle");
    toggle?.classList.toggle("is-active", searchOpen || !!searchQuery.trim());
    renderFeed();
  });

  searchClear?.addEventListener("click", () => {
    clearSearch();
    searchInput?.focus();
  });

  searchInput?.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (searchQuery.trim()) {
        clearSearch();
      } else {
        setSearchOpen(false);
      }
    }
  });

  document.addEventListener("click", (e) => {
    if (!searchOpen || !searchPanel) return;
    const chipsRow = document.getElementById("filter-chips");
    if (chipsRow && !chipsRow.contains(e.target)) {
      if (!searchQuery.trim()) setSearchOpen(false);
    }
  });
}

function switchTab(tabId) {
  document.querySelectorAll(".screen").forEach((el) => {
    el.hidden = el.dataset.screen !== tabId;
  });

  document.querySelectorAll(".gnb-item").forEach((btn) => {
    const active = btn.dataset.tab === tabId;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-current", active ? "page" : null);
  });

  const fab = document.getElementById("fab-compose");
  if (fab) fab.hidden = tabId !== "community";
}

document.querySelectorAll(".gnb-item").forEach((btn) => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

document.querySelectorAll(".filter-chip[data-filter]").forEach((chip) => {
  chip.addEventListener("click", () => {
    activeFilter = chip.dataset.filter;
    document.querySelectorAll(".filter-chip[data-filter]").forEach((c) => {
      const active = c === chip;
      c.classList.toggle("is-active", active);
      c.setAttribute("aria-selected", active);
    });
    renderFeed();
  });
});

document.getElementById("feed").addEventListener("click", (e) => {
  const translateBtn = e.target.closest("[data-translate]");
  if (translateBtn) {
    const id = translateBtn.dataset.translate;
    translationState[id] = !translationState[id];
    renderFeed();
    return;
  }

  const likeBtn = e.target.closest("[data-like]");
  if (likeBtn) {
    const post = POSTS.find((p) => p.id === likeBtn.dataset.like);
    if (post) {
      post.liked = !post.liked;
      post.likes += post.liked ? 1 : -1;
      renderFeed();
    }
    return;
  }

  const commentBtn = e.target.closest("[data-comment]");
  if (commentBtn) {
    alert("댓글 화면은 과제 범위 밖입니다. 카드에서 댓글 진입 경로만 제공합니다.");
  }
});

const composeSheet = document.getElementById("compose-sheet");
document.getElementById("fab-compose").addEventListener("click", () => {
  composeSheet.hidden = false;
});
document.querySelectorAll("[data-close-sheet]").forEach((el) => {
  el.addEventListener("click", () => {
    composeSheet.hidden = true;
  });
});

initSearch();
switchTab("community");
renderFeed();
