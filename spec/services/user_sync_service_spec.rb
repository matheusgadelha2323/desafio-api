require 'rails_helper'

RSpec.describe UserSyncService do
  let(:task) { create(:task) }
  let(:api_client) { instance_double(ExternalUserApiClient) }

  subject(:service) { described_class.new(task: task, api_client: api_client) }

  describe '#call' do
    context 'when API returns success' do
      let(:user_data) do
        {
          name: "Leanne Graham",
          company: "Romaguera-Crona",
          city: "Gwenborough"
        }
      end

      before do
        allow(api_client).to receive(:fetch_user)
          .and_return(ExternalUserApiClient::Result.success(user_data))
      end

      it 'returns success result' do
        result = service.call
        expect(result).to be_success
      end

      it 'updates task with external user data' do
        service.call
        task.reload

        expect(task.external_user_name).to eq("Leanne Graham")
        expect(task.external_company).to eq("Romaguera-Crona")
        expect(task.external_city).to eq("Gwenborough")
      end

      it 'returns the updated task' do
        result = service.call
        expect(result.task).to eq(task)
      end
    end

    context 'when API returns failure' do
      before do
        allow(api_client).to receive(:fetch_user)
          .and_return(ExternalUserApiClient::Result.failure("API error"))
      end

      it 'returns failure result' do
        result = service.call
        expect(result).to be_failure
      end

      it 'includes error message' do
        result = service.call
        expect(result.error).to eq("API error")
      end

      it 'does not update task' do
        service.call
        task.reload

        expect(task.external_user_name).to be_nil
      end
    end
  end
end
