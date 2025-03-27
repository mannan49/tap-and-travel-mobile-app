import { View } from "react-native";
import Routes from "./src/Navigations/Route";
import FlashMessage from "react-native-flash-message";
import { Provider } from "react-redux";
import store from "./src/store/store";
import { AuthProvider } from "./src/context/AuthContext";
import { StripeProvider } from "@stripe/stripe-react-native";
import Toast from "react-native-toast-message";
import { ThemeProvider } from "./src/theme/theme";

export default function App() {
  return (
    <StripeProvider publishableKey="pk_test_51QMkUFKzfMgYIpCx3iDEwl4GbcNYQyEwhJKqGsc8BAuQ8h7pHFJqjhGR6LfImDlOojLfiV0DngTdZv1OBiv3w8c500a980IyyP">
      <Provider store={store}>
        <AuthProvider>
          <ThemeProvider>
            <View style={{ flex: 1 }}>
              <Routes />
              <Toast />
              <FlashMessage position="top" />
            </View>
          </ThemeProvider>
        </AuthProvider>
      </Provider>
    </StripeProvider>
  );
}
