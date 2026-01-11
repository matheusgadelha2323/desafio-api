FactoryBot.define do
  factory :task do
    sequence(:title) { |n| "Task #{n}" }
    completed { false }
    external_user_name { nil }
    external_company { nil }
    external_city { nil }

    trait :completed do
      completed { true }
    end

    trait :synced do
      external_user_name { "Leanne Graham" }
      external_company { "Romaguera-Crona" }
      external_city { "Gwenborough" }
    end
  end
end
