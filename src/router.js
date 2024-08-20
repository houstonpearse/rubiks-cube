function route(event) {
  event.preventDefault();
  window.history.pushState({}, "", event.target.href);
  handleLocation();
}

const routes = {
  "/": "/pages/index.html",
  "/solve": "/pages/solve.html",
  "/learn": "/pages/learn.html",
  "/settings": "/pages/settings.html",
};

const handleLocation = async () => {
  console.log("handleLocation");
  const path = window.location.pathname;
  const route = routes[path] || routes["/"];
  const html = await fetch(route).then((data) => data.text());
  document.getElementById("main").innerHTML = html;
};

window.onpopstate = handleLocation;

if (window.location.pathname !== "/") handleLocation();
