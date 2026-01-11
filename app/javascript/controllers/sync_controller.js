import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["text"]

  submit(event) {
    this.element.disabled = true
    this.element.classList.add("opacity-75", "cursor-not-allowed")

    setTimeout(() => {
      this.clearFlashMessage()
    }, 5000)
  }

  clearFlashMessage() {
    const flash = document.getElementById("flash")
    if (flash) {
      flash.innerHTML = ""
    }
  }
}
