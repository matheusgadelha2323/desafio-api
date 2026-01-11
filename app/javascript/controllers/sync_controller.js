import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["text"]

  connect() {
    this.form = this.element.closest("form")
    if (this.form) {
      this.form.addEventListener("turbo:submit-end", this.handleSubmitEnd.bind(this))
    }
  }

  disconnect() {
    if (this.form) {
      this.form.removeEventListener("turbo:submit-end", this.handleSubmitEnd.bind(this))
    }
  }

  handleSubmitEnd() {
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
