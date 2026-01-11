class ExternalUserApiClient
  BASE_URL = "https://jsonplaceholder.typicode.com".freeze
  TIMEOUT = 10

  def initialize(connection: nil)
    @connection = connection || default_connection
  end

  def fetch_user(user_id)
    response = @connection.get("/users/#{user_id}")

    return Result.failure("API retornou status #{response.status}") unless response.success?

    Result.success(parse_user_data(response.body))
  rescue Faraday::Error => e
    Result.failure("Erro de conexão: #{e.message}")
  end

  private

  def default_connection
    Faraday.new(url: BASE_URL) do |faraday|
      faraday.request :json
      faraday.response :json
      faraday.options.timeout = TIMEOUT
      faraday.options.open_timeout = TIMEOUT
    end
  end

  def parse_user_data(data)
    {
      name: data["name"],
      company: data.dig("company", "name"),
      city: data.dig("address", "city")
    }
  end

  class Result
    attr_reader :data, :error

    def initialize(success:, data: nil, error: nil)
      @success = success
      @data = data
      @error = error
    end

    def success?
      @success
    end

    def failure?
      !@success
    end

    def self.success(data)
      new(success: true, data: data)
    end

    def self.failure(error)
      new(success: false, error: error)
    end
  end
end
