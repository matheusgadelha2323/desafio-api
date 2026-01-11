FactoryBot.define do
  factory :task do
    title { "MyString" }
    completed { false }
    external_user_name { "MyString" }
    external_company { "MyString" }
    external_city { "MyString" }
  end
end
