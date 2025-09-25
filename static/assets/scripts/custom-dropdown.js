/**
 * Custom Dropdown Component for SlowGuardian v9
 */

class CustomDropdown {
  constructor(element) {
    this.element = element;
    this.isOpen = false;
    this.selectedValue = element.value || element.querySelector("option").value;
    this.selectedText =
      element.querySelector(`option[value="${this.selectedValue}"]`)
        ?.textContent || element.querySelector("option").textContent;

    this.init();
  }

  init() {
    this.createCustomDropdown();
    this.bindEvents();
    this.hideOriginalSelect();
  }

  createCustomDropdown() {
    const wrapper = document.createElement("div");
    wrapper.className = "custom-dropdown";

    const selected = document.createElement("div");
    selected.className = "dropdown-selected";
    selected.innerHTML = `
      <span class="dropdown-text">${this.selectedText}</span>
      <span class="dropdown-arrow">▼</span>
    `;

    const options = document.createElement("div");
    options.className = "dropdown-options";

    // Create options from original select
    const selectOptions = this.element.querySelectorAll("option");
    selectOptions.forEach((option) => {
      const optionElement = document.createElement("div");
      optionElement.className = "dropdown-option";
      optionElement.dataset.value = option.value;
      optionElement.textContent = option.textContent;

      if (option.value === this.selectedValue) {
        optionElement.classList.add("selected");
      }

      options.appendChild(optionElement);
    });

    wrapper.appendChild(selected);
    wrapper.appendChild(options);

    // Insert custom dropdown after original select
    this.element.parentNode.insertBefore(wrapper, this.element.nextSibling);

    this.customDropdown = wrapper;
    this.selectedElement = selected;
    this.optionsElement = options;
  }

  bindEvents() {
    // Toggle dropdown
    this.selectedElement.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggle();
    });

    // Option selection
    this.optionsElement.addEventListener("click", (e) => {
      if (e.target.classList.contains("dropdown-option")) {
        this.selectOption(e.target);
      }
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!this.customDropdown.contains(e.target)) {
        this.close();
      }
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (this.isOpen) {
        switch (e.key) {
          case "Escape":
            this.close();
            break;
          case "ArrowDown":
            e.preventDefault();
            this.navigateOptions(1);
            break;
          case "ArrowUp":
            e.preventDefault();
            this.navigateOptions(-1);
            break;
          case "Enter":
            e.preventDefault();
            const focused = this.optionsElement.querySelector(
              ".dropdown-option.focused"
            );
            if (focused) {
              this.selectOption(focused);
            }
            break;
        }
      }
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    // Close other dropdowns
    document.querySelectorAll(".custom-dropdown.open").forEach((dropdown) => {
      if (dropdown !== this.customDropdown) {
        dropdown.classList.remove("open");
      }
    });

    this.customDropdown.classList.add("open");
    this.isOpen = true;

    // Focus first option
    const firstOption = this.optionsElement.querySelector(".dropdown-option");
    if (firstOption) {
      firstOption.classList.add("focused");
    }
  }

  close() {
    this.customDropdown.classList.remove("open");
    this.isOpen = false;

    // Remove focus from all options
    this.optionsElement
      .querySelectorAll(".dropdown-option")
      .forEach((option) => {
        option.classList.remove("focused");
      });
  }

  selectOption(optionElement) {
    const value = optionElement.dataset.value;
    const text = optionElement.textContent;

    // Update selected state
    this.optionsElement
      .querySelectorAll(".dropdown-option")
      .forEach((option) => {
        option.classList.remove("selected");
      });
    optionElement.classList.add("selected");

    // Update display
    this.selectedElement.querySelector(".dropdown-text").textContent = text;

    // Update original select
    this.element.value = value;

    // Trigger change event
    const changeEvent = new Event("change", { bubbles: true });
    this.element.dispatchEvent(changeEvent);

    // Store values
    this.selectedValue = value;
    this.selectedText = text;

    this.close();
  }

  navigateOptions(direction) {
    const options = this.optionsElement.querySelectorAll(".dropdown-option");
    const currentFocused = this.optionsElement.querySelector(
      ".dropdown-option.focused"
    );

    let currentIndex = currentFocused
      ? Array.from(options).indexOf(currentFocused)
      : -1;

    // Remove current focus
    if (currentFocused) {
      currentFocused.classList.remove("focused");
    }

    // Calculate new index
    currentIndex += direction;
    if (currentIndex < 0) currentIndex = options.length - 1;
    if (currentIndex >= options.length) currentIndex = 0;

    // Add focus to new option
    options[currentIndex].classList.add("focused");

    // Scroll into view
    options[currentIndex].scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }

  hideOriginalSelect() {
    this.element.style.display = "none";
  }

  destroy() {
    if (this.customDropdown) {
      this.customDropdown.remove();
    }
    this.element.style.display = "";
  }
}

// Auto-initialize custom dropdowns
function initCustomDropdowns() {
  const selects = document.querySelectorAll("select.form-select");
  selects.forEach((select) => {
    if (!select.dataset.customDropdown) {
      new CustomDropdown(select);
      select.dataset.customDropdown = "true";
    }
  });
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initCustomDropdowns);

// Re-initialize if new selects are added dynamically
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1) {
        // Element node
        const selects = node.querySelectorAll
          ? node.querySelectorAll("select.form-select")
          : [];
        selects.forEach((select) => {
          if (!select.dataset.customDropdown) {
            new CustomDropdown(select);
            select.dataset.customDropdown = "true";
          }
        });
      }
    });
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
