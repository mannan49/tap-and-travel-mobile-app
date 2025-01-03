export const apiBaseUrl = "https://tap-and-travel-backend.vercel.app/api/v1";
export const getApiUrl = (endpoint) => apiBaseUrl + endpoint;

export const LOGIN = getApiUrl("/user/login");
export const SIGNUP = getApiUrl("/user/register");
