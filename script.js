const COUNTER_BASE_URL =
  "https://api.counterapi.dev/v2/krilwyas-team-2939/stalfrogcount";
const LS_COUNT = "stalFrogCount";
const LS_SIGNED = "stalFrogSigned";

const countEl = document.getElementById("signatureCount");
const signBtn = document.getElementById("signButton");
const statusEl = document.getElementById("statusText");
const img = document.getElementById("stalImage");

let currentCount = 0;

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
  const response = await fetch(COUNTER_BASE_URL);
  if (!response.ok) throw new Error("Could not fetch counter");
  const data = await response.json();
  return data.data.up_count || 0;
}

async function incrementCountFromApi() {
  const response = await fetch(`${COUNTER_BASE_URL}/up`);
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
  }
}

loadCount();
setSignedState(localStorage.getItem(LS_SIGNED) === "true");
signBtn.addEventListener("click", signPetition);
