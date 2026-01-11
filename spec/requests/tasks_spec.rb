require 'rails_helper'

RSpec.describe "Tasks", type: :request do
  let!(:task) { create(:task) }

  let(:api_response) do
    {
      "id" => 1,
      "name" => "Leanne Graham",
      "address" => { "city" => "Gwenborough" },
      "company" => { "name" => "Romaguera-Crona" }
    }
  end

  describe "GET /tasks/:id" do
    it "returns success" do
      get task_path(task)
      expect(response).to have_http_status(:success)
    end

    it "renders task title" do
      get task_path(task)
      expect(response.body).to include(task.title)
    end
  end

  describe "POST /tasks/:id/sync" do
    before do
      stub_request(:get, "https://jsonplaceholder.typicode.com/users/1")
        .to_return(
          status: 200,
          body: api_response.to_json,
          headers: { 'Content-Type' => 'application/json' }
        )
    end

    context "with HTML format" do
      it "redirects to task" do
        post sync_task_path(task)
        expect(response).to redirect_to(task_path(task))
      end

      it "updates task with external data" do
        post sync_task_path(task)
        task.reload

        expect(task.external_user_name).to eq("Leanne Graham")
        expect(task.external_company).to eq("Romaguera-Crona")
        expect(task.external_city).to eq("Gwenborough")
      end
    end

    context "with Turbo Stream format" do
      it "returns turbo stream response" do
        post sync_task_path(task), headers: { "Accept" => "text/vnd.turbo-stream.html" }
        expect(response.media_type).to eq("text/vnd.turbo-stream.html")
      end

      it "includes turbo stream replace action" do
        post sync_task_path(task), headers: { "Accept" => "text/vnd.turbo-stream.html" }
        expect(response.body).to include('turbo-stream action="replace"')
      end
    end

    context "when API fails" do
      before do
        stub_request(:get, "https://jsonplaceholder.typicode.com/users/1")
          .to_return(status: 500)
      end

      it "redirects with error for HTML" do
        post sync_task_path(task)
        expect(response).to redirect_to(task_path(task))
        expect(flash[:alert]).to be_present
      end
    end
  end

  describe "GET /" do
    it "shows task with id 1" do
      get root_path
      expect(response).to have_http_status(:success)
    end
  end
end
