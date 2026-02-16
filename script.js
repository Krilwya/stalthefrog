const COUNT_NS = "stal-frog-movement";
const COUNT_KEY = "stal-frog-signatures";
const COUNT_UPDATE_KEY = "ut_DbEMrbf5lzrBj5s14ia0TNXeYIOKRhzb98n8bgAQ";
const LS_COUNT = "stalFrogCount";
const LS_SIGNED = "stalFrogSigned";

const countEl = document.getElementById("signatureCount");
const signBtn = document.getElementById("signButton");
const statusEl = document.getElementById("statusText");
const img = document.getElementById("stalImage");
const imgFallback = document.getElementById("imageFallback");

let currentCount = 0;

img.addEventListener("load", () => {
  imgFallback.style.display = "none";
});

img.addEventListener("error", () => {
  img.style.display = "none";
  imgFallback.style.display = "grid";
});

const formatCount = (value) => new Intl.NumberFormat().format(value);

const setCount = (value) => {
  currentCount = Math.max(0, Number(value) || 0);
  countEl.textContent = formatCount(currentCount);
};

const getLocalCount = () => Number(localStorage.getItem(LS_COUNT) || 0);

const setSignedState = (signed) => {
  if (signed) {
    signBtn.disabled = true;
    signBtn.textContent = "Already Signed";
    statusEl.classList.add("success");
    statusEl.textContent = "You are in. The frog agenda grows stronger.";
    return;
  }

  signBtn.disabled = false;
  signBtn.textContent = "Sign the Frog Rebrand";
  statusEl.classList.remove("success");
  statusEl.textContent = "One signature per browser.";
};

async function fetchCountFromApi() {
  const response = await fetch(`https://api.countapi.xyz/get/${COUNT_NS}/${COUNT_KEY}`);
  if (!response.ok) throw new Error("Could not fetch counter");
  const data = await response.json();
  return data.value || 0;
}

async function incrementCountFromApi() {
  const response = await fetch(
    `https://api.countapi.xyz/hit/${COUNT_NS}/${COUNT_KEY}?update_key=${encodeURIComponent(COUNT_UPDATE_KEY)}`
  );
  if (!response.ok) throw new Error("Could not increment counter");
  const data = await response.json();
  return data.value || currentCount + 1;
}

async function loadCount() {
  setCount(getLocalCount());

  try {
    const apiValue = await fetchCountFromApi();
    setCount(apiValue);
    localStorage.setItem(LS_COUNT, String(apiValue));
  } catch {
    statusEl.textContent = "Live counter offline. Showing local estimate.";
  }
}

async function signPetition() {
  const alreadySigned = localStorage.getItem(LS_SIGNED) === "true";
  if (alreadySigned) {
    setSignedState(true);
    return;
  }

  signBtn.disabled = true;
  signBtn.textContent = "Signing...";

  try {
    const next = await incrementCountFromApi();
    setCount(next);
    localStorage.setItem(LS_COUNT, String(next));
    localStorage.setItem(LS_SIGNED, "true");
    setSignedState(true);
  } catch {
    const fallback = currentCount + 1;
    setCount(fallback);
    localStorage.setItem(LS_COUNT, String(fallback));
    localStorage.setItem(LS_SIGNED, "true");
    setSignedState(true);
    statusEl.textContent = "Signed locally. Global counter is temporarily offline.";
  }
}

loadCount();
setSignedState(localStorage.getItem(LS_SIGNED) === "true");
signBtn.addEventListener("click", signPetition);
