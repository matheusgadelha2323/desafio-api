class UserSyncService
  DEFAULT_USER_ID = 1

  def initialize(task:, api_client: nil, user_id: DEFAULT_USER_ID)
    @task = task
    @api_client = api_client || ExternalUserApiClient.new
    @user_id = user_id
  end

  def call
    result = @api_client.fetch_user(@user_id)

    return Result.failure(result.error) if result.failure?

    update_task(result.data)
  end

  private

  def update_task(user_data)
    @task.update!(
      external_user_name: user_data[:name],
      external_company: user_data[:company],
      external_city: user_data[:city]
    )

    Result.success(@task)
  rescue ActiveRecord::RecordInvalid => e
    Result.failure("Erro ao atualizar task: #{e.message}")
  end

  class Result
    attr_reader :task, :error

    def initialize(success:, task: nil, error: nil)
      @success = success
      @task = task
      @error = error
    end

    def success?
      @success
    end

    def failure?
      !@success
    end

    def self.success(task)
      new(success: true, task: task)
    end

    def self.failure(error)
      new(success: false, error: error)
    end
  end
end
