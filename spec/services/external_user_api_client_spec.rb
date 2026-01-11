require 'rails_helper'

RSpec.describe ExternalUserApiClient do
  subject(:client) { described_class.new }

  let(:api_response) do
    {
      "id" => 1,
      "name" => "Leanne Graham",
      "username" => "Bret",
      "email" => "Sincere@april.biz",
      "address" => {
        "street" => "Kulas Light",
        "suite" => "Apt. 556",
        "city" => "Gwenborough",
        "zipcode" => "92998-3874"
      },
      "company" => {
        "name" => "Romaguera-Crona",
        "catchPhrase" => "Multi-layered client-server neural-net"
      }
    }
  end

  describe '#fetch_user' do
    context 'when API returns success' do
      before do
        stub_request(:get, "https://jsonplaceholder.typicode.com/users/1")
          .to_return(
            status: 200,
            body: api_response.to_json,
            headers: { 'Content-Type' => 'application/json' }
          )
      end

      it 'returns success result' do
        result = client.fetch_user(1)
        expect(result).to be_success
      end

      it 'returns parsed user data' do
        result = client.fetch_user(1)
        expect(result.data).to eq(
          name: "Leanne Graham",
          company: "Romaguera-Crona",
          city: "Gwenborough"
        )
      end
    end

    context 'when API returns error' do
      before do
        stub_request(:get, "https://jsonplaceholder.typicode.com/users/999")
          .to_return(status: 404)
      end

      it 'returns failure result' do
        result = client.fetch_user(999)
        expect(result).to be_failure
      end

      it 'includes error message' do
        result = client.fetch_user(999)
        expect(result.error).to include("404")
      end
    end

    context 'when connection fails' do
      before do
        stub_request(:get, "https://jsonplaceholder.typicode.com/users/1")
          .to_timeout
      end

      it 'returns failure result' do
        result = client.fetch_user(1)
        expect(result).to be_failure
      end

      it 'includes connection error message' do
        result = client.fetch_user(1)
        expect(result.error).to include("Erro de conexão")
      end
    end
  end
end
