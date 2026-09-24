const translateUi = (value) => window.siteI18n?.translate(value) || value;

const menuButton = document.querySelector("[data-menu-toggle]");
const mainNav = document.querySelector("[data-main-nav]");

if (menuButton && mainNav) {
  const closeMainMenu = (restoreFocus = false) => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", translateUi("Open navigation"));
    mainNav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    mainNav.querySelectorAll("[data-nav-dropdown]").forEach((dropdown) => {
      dropdown.classList.remove("is-open");
      dropdown.querySelector(".nav-dropdown-toggle")?.setAttribute("aria-expanded", "false");
    });
    if (restoreFocus) menuButton.focus();
  };

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeMainMenu();
    } else {
      menuButton.setAttribute("aria-expanded", "true");
      menuButton.setAttribute("aria-label", translateUi("Close navigation"));
      mainNav.classList.add("is-open");
      document.body.classList.add("menu-open");
    }
  });

  mainNav.addEventListener("click", (event) => {
    if (event.target.closest("a") && window.innerWidth <= 1050) {
      closeMainMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (
      window.innerWidth <= 1050 &&
      mainNav.classList.contains("is-open") &&
      !event.target.closest(".site-header")
    ) {
      closeMainMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mainNav.classList.contains("is-open")) {
      closeMainMenu(true);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1050) {
      closeMainMenu();
    }
  });
}

const navDropdowns = [...document.querySelectorAll("[data-nav-dropdown]")];

const closeNavDropdown = (dropdown, restoreFocus = false) => {
  const toggle = dropdown.querySelector(".nav-dropdown-toggle");
  dropdown.classList.remove("is-open");
  toggle?.setAttribute("aria-expanded", "false");
  if (restoreFocus) toggle?.focus();
};

const openNavDropdown = (dropdown) => {
  navDropdowns.forEach((item) => {
    if (item !== dropdown) closeNavDropdown(item);
  });
  dropdown.classList.add("is-open");
  dropdown.querySelector(".nav-dropdown-toggle")?.setAttribute("aria-expanded", "true");
};

navDropdowns.forEach((dropdown) => {
  const toggle = dropdown.querySelector(".nav-dropdown-toggle");
  const menu = dropdown.querySelector(".nav-dropdown-menu");
  const links = menu ? [...menu.querySelectorAll("a")] : [];

  toggle?.setAttribute("aria-haspopup", "true");

  toggle?.addEventListener("click", () => {
    const isOpen = dropdown.classList.contains("is-open");
    if (isOpen) closeNavDropdown(dropdown);
    else openNavDropdown(dropdown);
  });

  toggle?.addEventListener("keydown", (event) => {
    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && links.length) {
      event.preventDefault();
      openNavDropdown(dropdown);
      links[event.key === "ArrowDown" ? 0 : links.length - 1].focus();
    }
  });

  menu?.addEventListener("keydown", (event) => {
    const currentIndex = links.indexOf(document.activeElement);
    if (event.key === "Escape") {
      event.preventDefault();
      closeNavDropdown(dropdown, true);
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = (currentIndex + direction + links.length) % links.length;
      links[nextIndex].focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      links[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      links[links.length - 1]?.focus();
    }
  });
});

document.addEventListener("click", (event) => {
  navDropdowns.forEach((dropdown) => {
    if (!dropdown.contains(event.target)) closeNavDropdown(dropdown);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    navDropdowns.forEach((dropdown) => {
      if (dropdown.classList.contains("is-open")) closeNavDropdown(dropdown, true);
    });
  }
});

document
  .querySelectorAll("#publications-panel tbody, #dissemination-panel tbody")
  .forEach((tableBody) => {
    [...tableBody.rows]
      .sort((rowA, rowB) => {
        const yearA = Number.parseInt(rowA.cells[1]?.textContent || "0", 10);
        const yearB = Number.parseInt(rowB.cells[1]?.textContent || "0", 10);
        return yearB - yearA;
      })
      .forEach((row) => tableBody.append(row));
  });

document.querySelectorAll("[data-accordion-trigger]").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const panel = document.getElementById(trigger.getAttribute("aria-controls"));
    const expanded = trigger.getAttribute("aria-expanded") === "true";
    trigger.setAttribute("aria-expanded", String(!expanded));
    if (panel) panel.hidden = expanded;

    if (!expanded && trigger.closest(".detail-output-accordion")) {
      document
        .querySelectorAll(`.detail-deliverable-tabs [href="#${panel?.id}"]`)
        .forEach((activeTab) => {
          const tabs = activeTab.closest(".detail-deliverable-tabs");
          tabs?.querySelectorAll("[data-deliverable-tab]").forEach((tab) => {
            const active = tab === activeTab;
            tab.classList.toggle("is-active", active);
            if (active) tab.setAttribute("aria-current", "true");
            else tab.removeAttribute("aria-current");
          });
        });
    }
  });
});

document.querySelectorAll(".publication-materials .publication-metadata p").forEach((item) => {
  const label = item.querySelector(":scope > strong")?.textContent.trim();
  if (label === "Notes" || label === "Notas") item.remove();
});

document.querySelectorAll(".detail-deliverable-tabs").forEach((tabList) => {
  const tabs = [...tabList.querySelectorAll("[data-deliverable-tab]")];
  const accordion = tabList.nextElementSibling;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const panelId = tab.getAttribute("aria-controls");
      const panel = panelId ? document.getElementById(panelId) : null;
      const item = panel?.closest(".accordion-item");
      const trigger = item?.querySelector("[data-accordion-trigger]");

      accordion?.querySelectorAll(".accordion-item").forEach((accordionItem) => {
        const itemTrigger = accordionItem.querySelector("[data-accordion-trigger]");
        const itemPanel = document.getElementById(
          itemTrigger?.getAttribute("aria-controls") || "",
        );
        const isTarget = accordionItem === item;
        itemTrigger?.setAttribute("aria-expanded", String(isTarget));
        if (itemPanel) itemPanel.hidden = !isTarget;
      });

      if (trigger && panel) {
        trigger.setAttribute("aria-expanded", "true");
        panel.hidden = false;
      }

      tabs.forEach((itemTab) => {
        const active = itemTab === tab;
        itemTab.classList.toggle("is-active", active);
        if (active) itemTab.setAttribute("aria-current", "true");
        else itemTab.removeAttribute("aria-current");
      });
    });
  });
});

document.querySelectorAll("[data-filter-group]").forEach((group) => {
  const buttons = group.querySelectorAll("[data-filter]");
  const targetSelector = group.dataset.filterTarget;
  const targets = document.querySelectorAll(targetSelector);

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      const yearToggle = group.querySelector("[data-year-filter-toggle]");
      const yearDropdown = group.querySelector("[data-year-filter]");

      if (yearToggle) {
        yearToggle.classList.remove("is-active");
        yearToggle.setAttribute("aria-expanded", "false");
        yearToggle.textContent = translateUi("Year");
      }
      yearDropdown?.classList.remove("is-open");

      buttons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });

      targets.forEach((target) => {
        const categories = (target.dataset.category || "").split(" ");
        target.hidden = filter !== "all" && !categories.includes(filter);
      });
    });
  });
});

document.querySelectorAll("[data-year-filter]").forEach((dropdown) => {
  const toggle = dropdown.querySelector("[data-year-filter-toggle]");
  const yearButtons = [...dropdown.querySelectorAll("[data-project-year]")];
  const filterGroup = dropdown.closest("[data-filter-group]");
  const targetSelector = filterGroup?.dataset.filterTarget;
  const targets = targetSelector ? [...document.querySelectorAll(targetSelector)] : [];

  const close = () => {
    dropdown.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
  };

  toggle?.addEventListener("click", () => {
    const willOpen = !dropdown.classList.contains("is-open");
    dropdown.classList.toggle("is-open", willOpen);
    toggle.setAttribute("aria-expanded", String(willOpen));
  });

  toggle?.addEventListener("keydown", (event) => {
    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && yearButtons.length) {
      event.preventDefault();
      dropdown.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      yearButtons[event.key === "ArrowDown" ? 0 : yearButtons.length - 1].focus();
    }
  });

  yearButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      const year = button.dataset.projectYear;
      filterGroup?.querySelectorAll("[data-filter]").forEach((filterButton) => {
        filterButton.classList.remove("is-active");
        filterButton.setAttribute("aria-pressed", "false");
      });
      toggle?.classList.add("is-active");
      if (toggle) toggle.textContent = translateUi(`Year: ${year}`);
      targets.forEach((target) => {
        target.hidden = !(target.dataset.years || "").split(" ").includes(year);
      });
      close();
    });

    button.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        toggle?.focus();
      } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const direction = event.key === "ArrowDown" ? 1 : -1;
        yearButtons[(index + direction + yearButtons.length) % yearButtons.length].focus();
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (!dropdown.contains(event.target)) close();
  });
});

document.querySelectorAll("[data-thesis-filters]").forEach((filters) => {
  const section = filters.closest(".network-students");
  const cards = [...(section?.querySelectorAll("[data-thesis-student]") || [])];
  const groups = [...(section?.querySelectorAll("[data-thesis-group]") || [])];
  const statusButtons = [...filters.querySelectorAll("[data-thesis-status]")];
  const yearDropdown = filters.querySelector("[data-thesis-year-filter]");
  const yearToggle = yearDropdown?.querySelector("[data-thesis-year-toggle]");
  const yearLabel = yearDropdown?.querySelector("[data-thesis-year-label]");
  const yearButtons = [...(yearDropdown?.querySelectorAll("[data-thesis-year]") || [])];
  const revealToggle = section?.querySelector('[data-reveal-toggle][aria-controls="thesis-student-cards"]');
  const revealContainer = revealToggle?.closest(".thesis-student-more");
  let activeStatus = "all";
  let activeYear = "all";

  const closeYearDropdown = () => {
    yearDropdown?.classList.remove("is-open");
    yearToggle?.setAttribute("aria-expanded", "false");
  };

  const updateStatusButtons = () => {
    statusButtons.forEach((button) => {
      const active = button.dataset.thesisStatus === activeStatus;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  };

  const applyThesisFilters = () => {
    const filtersActive = activeStatus !== "all" || activeYear !== "all";
    const revealExpanded = revealToggle?.getAttribute("aria-expanded") === "true";

    cards.forEach((card) => {
      const statusMatches = activeStatus === "all" || card.dataset.thesisStatus === activeStatus;
      const yearMatches = activeYear === "all" || card.dataset.thesisYear === activeYear;
      const isCollapsedExtra =
        !filtersActive && card.hasAttribute("data-reveal-item") && !revealExpanded;
      const isVisible = statusMatches && yearMatches && !isCollapsedExtra;
      card.hidden = !isVisible;
      card.classList.toggle("is-filtered-out", !isVisible);
      card.setAttribute("aria-hidden", String(!isVisible));
    });
    groups.forEach((group) => {
      const hasVisibleCards = [...group.querySelectorAll("[data-thesis-student]")].some(
        (card) => !card.hidden,
      );
      group.hidden = !hasVisibleCards;
    });
    if (revealContainer) revealContainer.hidden = filtersActive;
  };

  statusButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeStatus = button.dataset.thesisStatus;
      activeYear = "all";
      if (yearLabel) yearLabel.textContent = translateUi("Year");
      yearToggle?.classList.remove("is-active");
      updateStatusButtons();
      closeYearDropdown();
      applyThesisFilters();
    });
  });

  yearToggle?.addEventListener("click", () => {
    const willOpen = !yearDropdown.classList.contains("is-open");
    yearDropdown.classList.toggle("is-open", willOpen);
    yearToggle.setAttribute("aria-expanded", String(willOpen));
  });

  yearToggle?.addEventListener("keydown", (event) => {
    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && yearButtons.length) {
      event.preventDefault();
      yearDropdown.classList.add("is-open");
      yearToggle.setAttribute("aria-expanded", "true");
      yearButtons[event.key === "ArrowDown" ? 0 : yearButtons.length - 1].focus();
    }
  });

  yearButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      activeYear = button.dataset.thesisYear;
      activeStatus = "all";
      if (yearLabel) yearLabel.textContent = activeYear === "all" ? translateUi("Year") : activeYear;
      yearToggle?.classList.toggle("is-active", activeYear !== "all");
      updateStatusButtons();
      closeYearDropdown();
      applyThesisFilters();
    });

    button.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeYearDropdown();
        yearToggle?.focus();
      } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const direction = event.key === "ArrowDown" ? 1 : -1;
        yearButtons[(index + direction + yearButtons.length) % yearButtons.length].focus();
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (yearDropdown && !yearDropdown.contains(event.target)) closeYearDropdown();
  });

  applyThesisFilters();
});

document.querySelectorAll("[data-publication-filters]").forEach((filters) => {
  const publicationContainer = filters.closest(".container");
  const cards = [...(publicationContainer?.querySelectorAll("[data-publication-card]") || [])];
  const typeButtons = [...filters.querySelectorAll("[data-publication-type]")];
  const dropdowns = [...filters.querySelectorAll("[data-publication-dropdown]")];
  const pagination = publicationContainer?.querySelector("[data-publication-pagination]");
  const results = filters.querySelector("[data-publication-results]");
  const emptyState = publicationContainer?.querySelector("[data-publication-empty]");
  const pageSize = 8;
  let activeType = "all";
  let activePeriod = "all";
  let activeYear = "all";
  let currentPage = 1;

  const applyPublicationFilters = () => {
    const currentYear = new Date().getFullYear();
    const matchingCards = cards.filter((card) => {
      const cardYear = Number(card.dataset.year);
      const typeMatches = activeType === "all" || card.dataset.category === activeType;
      const yearMatches = activeYear === "all" || card.dataset.year === activeYear;
      const periodMatches = activePeriod === "all" || cardYear >= currentYear - 2;
      return typeMatches && yearMatches && periodMatches;
    });

    const totalPages = Math.max(1, Math.ceil(matchingCards.length / pageSize));
    currentPage = Math.min(currentPage, totalPages);
    const firstCard = (currentPage - 1) * pageSize;
    const visibleCards = new Set(matchingCards.slice(firstCard, firstCard + pageSize));

    cards.forEach((card) => {
      card.hidden = !visibleCards.has(card);
    });

    if (results) {
      const noun = matchingCards.length === 1 ? "publication" : "publications";
      results.textContent = translateUi(`${matchingCards.length} ${noun}${matchingCards.length ? ` · Page ${currentPage} of ${totalPages}` : ""}`);
    }
    if (emptyState) emptyState.hidden = matchingCards.length > 0;

    if (pagination) {
      pagination.replaceChildren();
      pagination.hidden = totalPages <= 1 || matchingCards.length === 0;

      const addPageButton = (label, page, options = {}) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        button.disabled = Boolean(options.disabled);
        button.setAttribute("aria-label", translateUi(options.ariaLabel || `Page ${page}`));
        if (page === currentPage && !options.navigation) button.setAttribute("aria-current", "page");
        button.addEventListener("click", () => {
          currentPage = page;
          applyPublicationFilters();
          filters.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
            block: "start",
          });
        });
        pagination.append(button);
      };

      addPageButton("←", Math.max(1, currentPage - 1), {
        disabled: currentPage === 1,
        ariaLabel: translateUi("Previous publication page"),
        navigation: true,
      });
      for (let page = 1; page <= totalPages; page += 1) addPageButton(String(page), page);
      addPageButton("→", Math.min(totalPages, currentPage + 1), {
        disabled: currentPage === totalPages,
        ariaLabel: translateUi("Next publication page"),
        navigation: true,
      });
    }
  };

  const closeDropdown = (dropdown) => {
    dropdown.classList.remove("is-open");
    dropdown.querySelector("[data-publication-dropdown-toggle]")?.setAttribute("aria-expanded", "false");
  };

  typeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeType = button.dataset.publicationType;
      currentPage = 1;
      typeButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      applyPublicationFilters();
    });
  });

  dropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector("[data-publication-dropdown-toggle]");
    const menuButtons = [...dropdown.querySelectorAll("[role='menuitem']")];

    toggle?.addEventListener("click", () => {
      const willOpen = !dropdown.classList.contains("is-open");
      dropdowns.forEach(closeDropdown);
      dropdown.classList.toggle("is-open", willOpen);
      toggle.setAttribute("aria-expanded", String(willOpen));
    });

    toggle?.addEventListener("keydown", (event) => {
      if ((event.key === "ArrowDown" || event.key === "ArrowUp") && menuButtons.length) {
        event.preventDefault();
        dropdowns.forEach(closeDropdown);
        dropdown.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
        menuButtons[event.key === "ArrowDown" ? 0 : menuButtons.length - 1].focus();
      }
    });

    menuButtons.forEach((button, index) => {
      button.addEventListener("click", () => {
        if (button.dataset.publicationPeriod) {
          activePeriod = button.dataset.publicationPeriod;
          filters.querySelector("[data-publication-period-label]").textContent = button.textContent.trim();
        }
        if (button.dataset.publicationYear) {
          activeYear = button.dataset.publicationYear;
          filters.querySelector("[data-publication-year-label]").textContent = activeYear === "all" ? translateUi("Year") : activeYear;
        }
        currentPage = 1;
        closeDropdown(dropdown);
        applyPublicationFilters();
      });

      button.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          closeDropdown(dropdown);
          toggle?.focus();
        } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          const direction = event.key === "ArrowDown" ? 1 : -1;
          menuButtons[(index + direction + menuButtons.length) % menuButtons.length].focus();
        }
      });
    });
  });

  document.addEventListener("click", (event) => {
    dropdowns.forEach((dropdown) => {
      if (!dropdown.contains(event.target)) closeDropdown(dropdown);
    });
  });

  applyPublicationFilters();
});

document.querySelectorAll("[data-publication-toggle]").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const details = document.getElementById(toggle.getAttribute("aria-controls"));
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    toggle.closest("[data-publication-card]")?.classList.toggle("is-expanded", !expanded);
    if (details) details.hidden = expanded;
  });
});

document.querySelectorAll("[data-collaborator-filters]").forEach((filters) => {
  const section = filters.closest(".network-collaborators");
  const cards = [...(section?.querySelectorAll("[data-collaborator]") || [])];
  const buttons = [...filters.querySelectorAll("[data-collaborator-filter]")];
  const revealToggle = section?.querySelector('[data-reveal-toggle][aria-controls="collaborator-cards"]');
  const revealContainer = revealToggle?.closest(".network-more");
  const emptyState = section?.querySelector("[data-collaborator-empty]");
  const cardGrid = section?.querySelector("#collaborator-cards");
  const surnameByName = new Map([
    ["Silvano F. Dal Sasso", "Dal Sasso"],
    ["Panayiotis Dimitriadis", "Dimitriadis"],
    ["Salvatore Grimaldi", "Grimaldi"],
    ["Theano Iliopoulou", "Iliopoulou"],
    ["Demetris Koutsoyiannis", "Koutsoyiannis"],
    ["Rodrigo Astroza", "Astroza"],
    ["Sebastián Krogh", "Krogh"],
    ["Oscar Link", "Link"],
    ["Pablo Mendoza", "Mendoza"],
    ["Eduardo Muñoz-Castro", "Muñoz-Castro"],
    ["Mauricio Zambrano-Bigiarini", "Zambrano-Bigiarini"],
    ["Salvatore Manfreda", "Manfreda"],
    ["Matthew Perks", "Perks"],
    ["Enrico Tubaldi", "Tubaldi"],
  ]);
  const surnameCollator = new Intl.Collator("en", { sensitivity: "base" });

  const collaboratorGroup = (card) => {
    const statusRank = card.dataset.collaboratorStatus === "active" ? 0 : 2;
    const scopeRank = card.dataset.collaboratorScope === "international" ? 0 : 1;
    return statusRank + scopeRank;
  };

  const collaboratorSurname = (card) => {
    const name = card.querySelector("h3")?.textContent.trim() || "";
    return surnameByName.get(name) || name.split(/\s+/).at(-1) || "";
  };

  cards.sort((firstCard, secondCard) => {
    const groupDifference = collaboratorGroup(firstCard) - collaboratorGroup(secondCard);
    return groupDifference || surnameCollator.compare(
      collaboratorSurname(firstCard),
      collaboratorSurname(secondCard),
    );
  });

  cards.forEach((card, index) => {
    cardGrid?.append(card);
    card.toggleAttribute("data-reveal-item", index >= 4);
    card.hidden = index >= 4;
  });
  let activeFilter = "all";

  const applyCollaboratorFilter = () => {
    const revealExpanded = revealToggle?.getAttribute("aria-expanded") === "true";
    let visibleCards = 0;

    cards.forEach((card) => {
      const matchesStatus = card.dataset.collaboratorStatus === activeFilter;
      const matchesScope = card.dataset.collaboratorScope === activeFilter;
      const matchesFilter = activeFilter === "all" || matchesStatus || matchesScope;
      const isCollapsedExtra =
        activeFilter === "all" && card.hasAttribute("data-reveal-item") && !revealExpanded;
      const isVisible = matchesFilter && !isCollapsedExtra;

      card.hidden = !isVisible;
      card.classList.toggle("is-filtered-out", !isVisible);
      card.setAttribute("aria-hidden", String(!isVisible));
      if (isVisible) visibleCards += 1;
    });

    if (revealContainer) revealContainer.hidden = activeFilter !== "all";
    if (emptyState) emptyState.hidden = visibleCards > 0;
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.collaboratorFilter;
      buttons.forEach((candidate) => {
        const isActive = candidate === button;
        candidate.classList.toggle("is-active", isActive);
        candidate.setAttribute("aria-pressed", String(isActive));
      });
      applyCollaboratorFilter();
    });
  });

  applyCollaboratorFilter();
});

document.querySelectorAll("[data-reveal-toggle]").forEach((toggle) => {
  const target = document.getElementById(toggle.getAttribute("aria-controls"));
  const label = toggle.querySelector("[data-reveal-label]");
  const items = target ? [...target.querySelectorAll("[data-reveal-item]")] : [];

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    const nextExpanded = !expanded;

    toggle.setAttribute("aria-expanded", String(nextExpanded));
    items.forEach((item) => {
      item.hidden = !nextExpanded;
      item.classList.toggle("is-filtered-out", !nextExpanded);
      item.setAttribute("aria-hidden", String(!nextExpanded));
    });

    if (label) {
      label.textContent = nextExpanded ? label.dataset.lessLabel : label.dataset.moreLabel;
    }
  });
});

document.querySelectorAll("[data-contact-form]").forEach((form) => {
  const status = form.querySelector("[data-form-status]");
  const submitButton = form.querySelector("[data-submit-button], button[type='submit']");
  const submitLabel = submitButton?.querySelector("[data-submit-label]");
  const publicKey = form.dataset.emailjsPublicKey;
  const serviceID = form.dataset.emailjsService;
  const templateID = form.dataset.emailjsTemplate;
  let emailJSInitialized = false;

  const showFormStatus = (message, type = "") => {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("is-success", type === "success");
    status.classList.toggle("is-error", type === "error");
    status.focus();
  };

  const setSubmitting = (isSubmitting) => {
    if (submitButton) submitButton.disabled = isSubmitting;
    if (submitLabel) {
      submitLabel.textContent = isSubmitting ? translateUi("Sending...") : translateUi("Send message");
    }
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    if (!publicKey || !serviceID || !templateID) {
      showFormStatus(
        translateUi("This form is not connected to an email service yet."),
        "error",
      );
      return;
    }

    if (!window.emailjs) {
      showFormStatus(
        translateUi("The email service could not be loaded. Please check your connection and try again."),
        "error",
      );
      return;
    }

    const purpose = form.elements.namedItem("purpose")?.value.trim();
    const titleInput = form.elements.namedItem("title");
    if (titleInput) {
      titleInput.value = purpose
        ? translateUi(`New website inquiry: ${purpose}`)
        : translateUi("New website inquiry");
    }

    setSubmitting(true);
    showFormStatus(translateUi("Sending your message..."));

    try {
      if (!emailJSInitialized) {
        window.emailjs.init(publicKey);
        emailJSInitialized = true;
      }

      await window.emailjs.sendForm(serviceID, templateID, form);
      form.reset();
      showFormStatus(
        translateUi("Your message has been sent successfully. Thank you for getting in touch."),
        "success",
      );
    } catch (error) {
      console.error("EmailJS contact form error:", error);
      showFormStatus(
        translateUi("We couldn't send your message. Please try again or contact Alonso by email."),
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  });
});

(() => {
  const lightbox = document.querySelector("[data-results-lightbox]");
  const triggers = [...document.querySelectorAll("[data-result-lightbox-trigger]")];
  if (!lightbox || !triggers.length) return;

  const dialog = lightbox.querySelector(".detail-lightbox-dialog");
  const image = lightbox.querySelector("[data-lightbox-image]");
  const title = lightbox.querySelector("[data-lightbox-title]");
  const description = lightbox.querySelector("[data-lightbox-description]");
  const counter = lightbox.querySelector("[data-lightbox-counter]");
  const previous = lightbox.querySelector("[data-lightbox-previous]");
  const next = lightbox.querySelector("[data-lightbox-next]");
  const closeButtons = [...lightbox.querySelectorAll("[data-lightbox-close]")];
  let currentIndex = 0;
  let returnFocusTarget = null;

  const renderResult = (index) => {
    currentIndex = (index + triggers.length) % triggers.length;
    const trigger = triggers[currentIndex];
    const thumbnail = trigger.querySelector(".detail-result-media img");

    image.src = trigger.dataset.lightboxSrc || thumbnail?.src || "";
    image.alt = thumbnail?.alt || "";
    title.textContent = translateUi(trigger.dataset.lightboxTitle || "Preliminary result");
    description.textContent = trigger.dataset.lightboxDescription || "";
    counter.textContent = `${currentIndex + 1} / ${triggers.length}`;
  };

  const showPrevious = () => renderResult(currentIndex - 1);
  const showNext = () => renderResult(currentIndex + 1);

  const openLightbox = (trigger) => {
    returnFocusTarget = trigger;
    renderResult(triggers.indexOf(trigger));
    lightbox.hidden = false;
    document.body.classList.add("results-lightbox-open");
    requestAnimationFrame(() => lightbox.querySelector(".detail-lightbox-close")?.focus());
  };

  const closeLightbox = () => {
    if (lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.classList.remove("results-lightbox-open");
    image.removeAttribute("src");
    returnFocusTarget?.focus();
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => openLightbox(trigger));
  });

  previous?.addEventListener("click", showPrevious);
  next?.addEventListener("click", showNext);
  closeButtons.forEach((button) => button.addEventListener("click", closeLightbox));

  document.addEventListener("keydown", (event) => {
    if (lightbox.hidden) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeLightbox();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPrevious();
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNext();
      return;
    }

    if (event.key !== "Tab") return;
    const focusable = [
      ...lightbox.querySelectorAll(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      ),
    ].filter((element) => !element.hidden);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    } else if (!lightbox.contains(document.activeElement)) {
      event.preventDefault();
      dialog?.focus();
    }
  });
})();
