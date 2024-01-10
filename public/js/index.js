const toggleButton = document.getElementsByClassName("toggle-button")[0];
const textLinks = document.getElementsByClassName("text-links")[0];
const navbar = document.getElementsByClassName("navbar")[0];

const sideToggle = document.getElementsByClassName("sideToggle")[0];
const sidebar = document.getElementsByClassName("sidebar")[0];
const content = document.getElementsByClassName("content")[0];

toggleButton.addEventListener("click", () => {
  textLinks.classList.toggle("active");
  navbar.classList.toggle("active");

  if (textLinks.classList.length == 2) {
    sidebar.classList.remove("active");
    content.classList.remove("active");
  }
});

sideToggle.addEventListener("click", () => {
  console.log(sidebar.classList.length);
  if (sidebar.classList.length == 1) {
    textLinks.classList.remove("active");
  }
  sidebar.classList.toggle("active");
  content.classList.toggle("active");
});

const alert = document.getElementsByClassName("alert")[0];

setTimeout(() => {
  alert.style.display = "none";
}, 4000);
