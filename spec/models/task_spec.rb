require 'rails_helper'

RSpec.describe Task, type: :model do
  describe 'validations' do
    it { is_expected.to validate_presence_of(:title) }
  end

  describe 'defaults' do
    subject(:task) { create(:task) }

    it 'has completed as false by default' do
      expect(task.completed).to be false
    end

    it 'has nil external fields by default' do
      expect(task.external_user_name).to be_nil
      expect(task.external_company).to be_nil
      expect(task.external_city).to be_nil
    end
  end

  describe 'traits' do
    context 'with :synced trait' do
      subject(:task) { create(:task, :synced) }

      it 'has external user data' do
        expect(task.external_user_name).to eq("Leanne Graham")
        expect(task.external_company).to eq("Romaguera-Crona")
        expect(task.external_city).to eq("Gwenborough")
      end
    end
  end
end
