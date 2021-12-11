document.querySelectorAll("#nav li").forEach(function(navEl) {
    navEl.onclick = function() { toggleTab(this.id, this.dataset.target); }
    if (navEl.classList.contains("is-active")) {
        navEl.classList.add("has-text-dark");
    }
});

function toggleTab(selectedNav, targetId) {
    var navEls = document.querySelectorAll("#nav li");

    navEls.forEach(function(navEl) {
        if (navEl.id == selectedNav) {
            navEl.classList.add("is-active");
            navEl.classList.add("has-text-dark");
        } else {
            if (navEl.classList.contains("is-active")) {
                navEl.classList.remove("is-active");
                navEl.classList.remove("has-text-dark");
            }
        }
    });

    var tabs = document.querySelectorAll(".tab-pane");

    tabs.forEach(function(tab) {
        if (tab.id == targetId) {
            tab.style.display = "block";
        } else {
            tab.style.display = "none";
        }
    });
}