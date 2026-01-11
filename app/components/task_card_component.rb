class TaskCardComponent < ApplicationComponent
  def initialize(task:)
    @task = task
  end

  private

  attr_reader :task
end
