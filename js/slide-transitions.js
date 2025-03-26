// Slide transition controller
class SlideController {
  constructor(config = {}) {
    // Default configuration
    this.config = {
      nextSlide: null,
      homeSlide: "index.html",
      transitionDuration: 300,
      steps: [], // Array of elements to reveal in sequence
      currentStep: 0, // Current step within the slide
      ...config,
    };

    // Initialize immediately if document is already loaded
    if (document.readyState === "complete" || document.readyState === "interactive") {
      this.init();
    } else {
      // Otherwise wait for DOMContentLoaded
      document.addEventListener("DOMContentLoaded", () => this.init());
    }
  }

  init() {
    // Check if the View Transitions API is supported
    if (!document.startViewTransition) {
      console.warn("View Transitions API is not supported in this browser.");
    }

    // Initialize steps if provided
    this.initializeSteps();
    
    this.setupNavigationLinks();
    this.setupKeyboardNavigation();
    
    // Log initialization for debugging
    console.log("SlideController initialized with config:", this.config);
  }
  
  initializeSteps() {
    // If steps are provided as selectors, convert them to DOM elements
    if (this.config.steps && this.config.steps.length > 0) {
      // Convert string selectors to DOM elements if needed
      this.config.steps = this.config.steps.map(step => 
        typeof step === 'string' ? document.querySelector(step) : step
      );
      
      // Hide all steps except the first one
      this.config.steps.forEach((step, index) => {
        if (step) {
          if (index > 0) {
            step.classList.add('hidden-step');
          } else {
            step.classList.remove('hidden-step');
          }
        }
      });
      
      this.config.currentStep = 0;
    }
  }
  
  nextStep() {
    // If we have steps defined
    if (this.config.steps && this.config.steps.length > 0) {
      // If we're not at the last step yet
      if (this.config.currentStep < this.config.steps.length - 1) {
        // Reveal the next step
        const nextStepElement = this.config.steps[this.config.currentStep + 1];
        if (nextStepElement) {
          if (document.startViewTransition) {
            document.startViewTransition(() => {
              nextStepElement.classList.remove('hidden-step');
            });
          } else {
            nextStepElement.classList.remove('hidden-step');
          }
        }
        this.config.currentStep++;
        return true; // Handled the step
      }
    }
    
    // If we don't have steps or we're at the last step, return false
    // to indicate we should move to the next slide
    return false;
  }
  
  previousStep() {
    // If we have steps defined
    if (this.config.steps && this.config.steps.length > 0) {
      // If we're not at the first step
      if (this.config.currentStep > 0) {
        // Hide the current step
        const currentStepElement = this.config.steps[this.config.currentStep];
        if (currentStepElement) {
          if (document.startViewTransition) {
            document.startViewTransition(() => {
              currentStepElement.classList.add('hidden-step');
            });
          } else {
            currentStepElement.classList.add('hidden-step');
          }
        }
        this.config.currentStep--;
        return true; // Handled the step
      }
    }
    
    // If we don't have steps or we're at the first step, return false
    // to indicate we should move to the previous slide
    return false;
  }

  setupNavigationLinks() {
    document.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", (e) => {
        // Only handle links to slides
        if (
          link.href.includes("/slides/") ||
          link.href.includes("index.html") ||
          link.classList.contains("prev-button") ||
          link.classList.contains("next-button") ||
          link.getAttribute("data-nav")
        ) {
          e.preventDefault();

          // If it's a "back" or "previous" link, try to go to previous step first
          if (
            link.classList.contains("prev-button") ||
            link.getAttribute("data-nav") === "prev"
          ) {
            if (!this.previousStep()) {
              // If we can't go back a step, navigate to previous page
              this.navigateBack();
            }
          } else if (
            link.classList.contains("next-button") || 
            link.getAttribute("data-nav") === "next"
          ) {
            // Try to advance to the next step first
            if (!this.nextStep() && this.config.nextSlide) {
              // If no more steps, go to next slide
              this.navigateToSlide(this.config.nextSlide);
            }
          } else {
            this.navigateToSlide(link.href);
          }
        }
      });
    });
  }

  setupKeyboardNavigation() {
    document.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
        case " ":
          e.preventDefault();
          // Try to advance to the next step first
          if (!this.nextStep() && this.config.nextSlide) {
            // If no more steps, go to next slide
            this.navigateToSlide(this.config.nextSlide);
          }
          break;
        case "ArrowLeft":
        case "ArrowUp":
        case "Backspace":
          e.preventDefault();
          // Try to go back to the previous step first
          if (!this.previousStep()) {
            // If we can't go back a step, navigate to previous page
            this.navigateBack();
          }
          break;
        case "Home":
          e.preventDefault();
          this.navigateToSlide(this.config.homeSlide);
          break;
      }
    });
  }

  navigateToSlide(url) {
    // Check if the View Transitions API is supported
    if (document.startViewTransition) {
      // For MPA transitions
      if (location.origin === new URL(url, location.href).origin) {
        // Same origin - use View Transitions API
        document.startViewTransition(() => {
          window.location.href = url;
        });
      } else {
        // Different origin - just navigate
        window.location.href = url;
      }
    } else {
      // Fallback for browsers that don't support View Transitions API
      window.location.href = url;
    }
  }

  navigateToSlide(url) {
    window.location.href = url;
  }

  navigateBack() {
    // if (document.startViewTransition) {
      // document.startViewTransition(() => {
        history.go(-1);
      // });
    // } else {
      // history.back();
    // }
  }
}

// Export the controller for use in slides
window.SlideController = SlideController;
