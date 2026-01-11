Task.find_or_create_by!(id: 1) do |task|
  task.title = "Minha primeira tarefa"
  task.completed = false
end
