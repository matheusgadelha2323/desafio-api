require "rails_helper"

RSpec.describe TaskCardComponent, type: :component do
  let(:task) { create(:task, title: "Test Task") }

  it "renders task title" do
    render_inline(described_class.new(task: task))
    expect(page).to have_text("Test Task")
  end

  it "renders sync button" do
    render_inline(described_class.new(task: task))
    expect(page).to have_button("Sincronizar usuário")
  end

  context "when task is not synced" do
    it "shows 'Não sincronizado' for user name" do
      render_inline(described_class.new(task: task))
      expect(page).to have_text("Não sincronizado")
    end
  end

  context "when task is synced" do
    let(:task) { create(:task, :synced) }

    it "shows external user name" do
      render_inline(described_class.new(task: task))
      expect(page).to have_text("Leanne Graham")
    end

    it "shows external company" do
      render_inline(described_class.new(task: task))
      expect(page).to have_text("Romaguera-Crona")
    end

    it "shows external city" do
      render_inline(described_class.new(task: task))
      expect(page).to have_text("Gwenborough")
    end
  end

  context "when task is synced (completed)" do
    let(:task) { create(:task, :completed) }

    it "shows synced badge" do
      render_inline(described_class.new(task: task))
      expect(page).to have_text("Sincronizado")
    end
  end

  context "when task is not synced (pending)" do
    it "shows not synced badge" do
      render_inline(described_class.new(task: task))
      expect(page).to have_text("Não sincronizado")
    end
  end
end
