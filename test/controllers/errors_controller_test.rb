require 'test_helper'

class ErrorsControllerTest < ActionDispatch::IntegrationTest
  test "should get 404" do
    get errors_404_url
    assert_response :success
  end

  test "should get 500" do
    get errors_500_url
    assert_response :success
  end

end
