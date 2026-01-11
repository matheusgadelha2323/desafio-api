class TasksController < ApplicationController
  before_action :set_task

  def show
  end

  def sync
    result = UserSyncService.new(task: @task).call

    respond_to do |format|
      if result.success?
        format.turbo_stream
        format.html { redirect_to @task, notice: "Usuário sincronizado com sucesso!" }
      else
        format.turbo_stream { render turbo_stream: turbo_stream.replace("flash", partial: "shared/flash", locals: { message: result.error, type: :error }) }
        format.html { redirect_to @task, alert: result.error }
      end
    end
  end

  private

  def set_task
    @task = Task.find(params[:id])
  end
end
